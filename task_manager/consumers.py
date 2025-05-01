import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def main(self):
        # 假設 main 用來做一些初始化的操作
        print(f"Room '{self.room_name}' initialized")
        # 你可以在這裡做一些必要的準備工作，這是一個額外的邏輯方法
    
    async def connect(self):
        print("Attempting to connect to the chat room...")
        self.room_name = 'chatroom'
        self.room_group_name = f"chat_{self.room_name}"

        # 調用 main 方法
        await self.main()

        # 加入聊天室的組
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # 接受 WebSocket 連接
        await self.accept()
        print("Connection established")

    async def disconnect(self, close_code):
        # 離開聊天室的組
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # 接收到 WebSocket 發來的消息
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # 發送消息到聊天室組
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # 接收到聊天室組發來的消息
    async def chat_message(self, event):
        message = event['message']

        # 發送消息到 WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
