# Chat
Chat (such an original name, I know), is a simple real-time chat application website. 
The frontend is written in React (using the next.js pages router and typescript) and the backend is written using FastAPI (with an SQLModel database).
This chat can also be used as a ground control station to a drone using my [DroneChatManager](https://github.com/oriub/DroneChatManager) repository 

![Screenshot 2024-05-05 005127](https://github.com/oriub/Chat/assets/164090680/84ecbb69-a349-4ccf-a42d-84c24831de08)
![login](https://github.com/oriub/Chat/assets/164090680/6e366e7e-b8f5-4c18-a017-359f53824a27)
![chat](https://github.com/oriub/Chat/assets/164090680/a75be5d2-b9bf-4705-8829-d2c6fb39724c)

## Running the chat
clone this repository:
```
git clone https://github.com/oriub/Chat.git
```
after cloning the repository, running the project should be done in 2 seperate steps (front and back seperately):
1. Backend:
     run the folloeing commands in the command line:
     ```
     cd <path where you cloned your repository>/Chat/backend
     uvicorn main:app --port 5000
     ```
     Now the FastAPI is running on localhost:8000, and you can look at its docs on localhost:8000/docs!
2. Frontend:
     run the following commands in the command line:
     ```
     cd <path where you cloned your repository>/Chat/chat
     npm run build
     npm start
     ```
Now the Chat is Fully running, and you can access it on http://localhost:3000/!
Now you can signup, login, and send messages to other users connected to the chat 😄
     

