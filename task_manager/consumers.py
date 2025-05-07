import json
from channels.generic.websocket import AsyncWebsocketConsumer
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember
from task_manager.models.message import Message
from django.contrib.auth.models import User
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract room_id from the URL
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'  # Create a unique group name for the room
        
        # Check if project exists and user has permission
        project_exists = await self.get_project(self.room_id)
        if not project_exists:
            await self.close()
            return
            
        # Check if user has permission (either project manager or member)
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return
            
        has_permission = await self.check_user_permission(self.room_id, user.id)
        if not has_permission:
            await self.close()
            return

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()  # Accept the WebSocket connection

    @database_sync_to_async
    def get_project(self, project_id):
        # This method runs in a thread, not in the async context
        return Project.objects.filter(project_id=project_id).exists()
        
    @database_sync_to_async
    def check_user_permission(self, project_id, user_id):
        # Check if user is project manager
        is_project_manager = Project.objects.filter(
            project_id=project_id, 
            user_id=user_id
        ).exists()
        
        # Check if user is project member
        is_member = ProjectMember.objects.filter(
            project_id=project_id, 
            user_id=user_id
        ).exists()
        
        return is_project_manager or is_member

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        
        # Get the user ID from the scope
        user = self.scope['user']
        user_id = user.id if user.is_authenticated else None
    
        # Check message type
        message_type = text_data_json.get('type', 'chat_message')
        
        if message_type in ['pin_message', 'unpin_message']:
            # Check if user is project manager before allowing pin/unpin actions
            is_project_manager = await self.is_project_manager(self.room_id, user_id)
            
            if not is_project_manager:
                return
                
            if message_type == 'pin_message':
                # Handle pin message
                message_id = text_data_json.get('message_id')
                message_content = text_data_json.get('message_content')
                
                # Save pinned message to database if needed
                if user_id and not message_id.startswith('temp-'):
                    await self.save_pinned_message(self.room_id, message_id)
                
                # Send pin message event to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'pin_message_event',
                        'message_id': message_id,
                        'message_content': message_content,
                        'user_id': user_id,
                    }
                )
            elif message_type == 'unpin_message':
                # Handle unpin message
                message_id = text_data_json.get('message_id')
                
                # Clear pinned message in database
                if user_id:
                    await self.clear_pinned_message(self.room_id)
                
                # Send unpin message event to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'unpin_message_event',
                        'message_id': message_id,
                        'user_id': user_id,
                    }
                )
        else:
            # Handle chat message
            message_content = text_data_json.get('message')
            
            if user_id:
                message_id = await self.save_message(self.room_id, user_id, message_content)
                
                # Send chat message event to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message_content,
                        'user_id': user_id,
                        'message_id': message_id,
                    }
                )

    @database_sync_to_async
    def is_project_manager(self, project_id, user_id):
        # Check if user is the project manager
        return Project.objects.filter(
            project_id=project_id, 
            user_id=user_id
        ).exists()

    @database_sync_to_async
    def clear_pinned_message(self, project_id):
        try:
            # Find and unpin all pinned messages for this project
            Message.objects.filter(
                project_id__project_id=project_id, 
                isPin=True
            ).update(isPin=False)
            return True
        except Exception as e:
            print(f"Error unpinning message: {e}")
            return False

    @database_sync_to_async
    def save_message(self, project_id, user_id, content):
        project = Project.objects.get(project_id=project_id)
        user = User.objects.get(id=user_id)

        # Create and save the message
        message = Message.objects.create(
            project_id=project,
            user_id=user,
            content=content
        )
        
        # Return the message_id instead of id
        return message.message_id

    @database_sync_to_async
    def save_pinned_message(self, project_id, message_id):
        try:
            project = Project.objects.get(project_id=project_id)
            # Use message_id instead of id
            message = Message.objects.get(message_id=message_id)
            
            # Set the pinned message flag
            message.isPin = True
            message.save()
            
            # You may also want to unpin previous messages
            Message.objects.filter(
                project_id=project_id, 
                isPin=True
            ).exclude(message_id=message_id).update(isPin=False)
            
            return True
        except Exception as e:
            print(f"Error pinning message: {e}")
            return False

    async def chat_message(self, event):
        message = event['message']
        user_id = event['user_id']
        message_id = event.get('message_id')
        
        # Send message to WebSocket (to all users including sender)
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message,
            'user_id': user_id,
            'message_id': message_id,
        }))
    
    async def pin_message_event(self, event):  # Renamed method
        message_id = event['message_id']
        message_content = event['message_content']
        
        # Send pinned message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'pin_message',
            'message_id': message_id,
            'message_content': message_content,
        }))

    async def unpin_message_event(self, event):
        message_id = event['message_id']
        
        # Send unpin message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'unpin_message',
            'message_id': message_id,
        }))