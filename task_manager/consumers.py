import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract room_id from the URL
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'  # Create a unique group name for the room

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()  # Accept the WebSocket connection

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive a message from the WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Get the user ID from the scope
        user_id = self.scope['user'].id if self.scope['user'].is_authenticated else None

        # Send the message to the room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',  # Event type
                'message': message,
                'user_id': user_id,  # Include the user ID
            }
        )

    # Receive a message from the room group
    async def chat_message(self, event):
        message = event['message']
        user_id = event['user_id']  # Get the user ID from the event

        # Send the message to the WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user_id': user_id,  # Include the user ID in the response
        }))