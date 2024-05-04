from fastapi import WebSocket
import json


class SocketConnectionManager:
    def __init__(self):
        self.connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.connections[username] = websocket

    def disconnect(self, username: str):
        if username in self.connections.keys():
            self.connections.pop(username)

    async def send_message(self,sender_username: str, recipient_username: str, message: str):
        recipient_connection = self.connections[recipient_username]
        dict_msg = {"sender": sender_username, "message": message}
        await recipient_connection.send_json(dict_msg)

