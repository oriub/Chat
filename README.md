# Chat
Chat (such an original name, I know), is a simple real-time chat application website. 
The frontend is written in React (using the next.js pages router and typescript) and the backend is written using FastAPI (with an SQLModel database).
This chat can also be used as a ground control station to a drone using the DroneChatManager repository

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
     
     

