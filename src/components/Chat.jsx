import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { uploadToCloudinary } from "../utils/cloudinary";

export default function Chat({ type, id, members = [] }) {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const dummy = useRef();
    const fileInputRef = useRef();

    useEffect(() => {
        const q = query(collection(db, type === "team" ? `teams/${id}/messages` : `chats/${id}/messages`), orderBy("createdAt", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
            setTimeout(() => dummy.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        return unsubscribe;
    }, [type, id]);

    async function sendMessage(e) {
        e.preventDefault();
        if ((!newMessage.trim() && !file) || uploading) return;

        setUploading(true);
        try {
            let fileData = null;
            if (file) {
                const url = await uploadToCloudinary(file);
                fileData = {
                    url,
                    name: file.name,
                    type: file.type.startsWith("image/") ? "image" : "file"
                };
            }

            await addDoc(collection(db, type === "team" ? `teams/${id}/messages` : `chats/${id}/messages`), {
                text: newMessage,
                createdAt: serverTimestamp(),
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                type: "text", // Default type
                replyTo: replyTo ? {
                    id: replyTo.id,
                    text: replyTo.text,
                    displayName: replyTo.displayName
                } : null,
                file: fileData
            });

            setNewMessage("");
            setFile(null);
            setReplyTo(null);
        } catch (error) {
            console.error("Error sending message:", error);
        }
        setUploading(false);
    }

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {messages.map(msg => {
                    const isMe = msg.uid === currentUser.uid;
                    const isSystem = msg.type === "system";

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-2">
                                <span className="text-xs text-gray-500 bg-slate-800/50 px-3 py-1 rounded-full">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                            <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[85%]`}>
                                
                                <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* Sender Name */}
                                    {!isMe && <p className="text-xs text-gray-400 ml-1">{msg.displayName}</p>}

                                    {/* Message Bubble */}
                                    <div className={`p-3 rounded-lg relative ${
                                        isMe 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-slate-700 text-gray-200 rounded-bl-none'
                                    }`}>
                                        
                                        {/* Reply Context */}
                                        {msg.replyTo && (
                                            <div className={`text-xs mb-2 p-2 rounded border-l-2 ${
                                                isMe ? 'bg-blue-700 border-blue-300 text-blue-100' : 'bg-slate-800 border-gray-500 text-gray-400'
                                            }`}>
                                                <span className="font-bold">{msg.replyTo.displayName}</span>: {msg.replyTo.text.substring(0, 30)}...
                                            </div>
                                        )}

                                        {/* File Attachment */}
                                        {msg.file && (
                                            <div className="mb-2">
                                                {msg.file.type === "image" ? (
                                                    <a href={msg.file.url} target="_blank" rel="noopener noreferrer">
                                                        <img src={msg.file.url} alt="attachment" className="max-w-full h-auto rounded max-h-48 object-cover hover:opacity-90 transition-opacity" />
                                                    </a>
                                                ) : (
                                                     <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/20 rounded hover:bg-black/30">
                                                        <span>📎</span>
                                                        <span className="underline truncate max-w-[150px]">{msg.file.name}</span>
                                                     </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Text with Mentions */}
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {msg.text}
                                        </p>
                                    </div>
                                    
                                    {/* Reply Button (visible on hover) */}
                                    <button 
                                        onClick={() => setReplyTo(msg)}
                                        className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={dummy}></div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
                {/* Reply Preview */}
                {replyTo && (
                    <div className="flex items-center justify-between bg-slate-700 p-2 rounded mb-2 text-sm text-gray-300 border-l-4 border-blue-500">
                        <div>
                            <span className="font-bold text-blue-400">Replying to {replyTo.displayName}</span>
                            <div className="text-xs text-gray-400 truncate max-w-xs">{replyTo.text || "Attachment"}</div>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                )}
                
                {/* File Preview */}
                {file && (
                    <div className="flex items-center justify-between bg-slate-700 p-2 rounded mb-2 text-sm text-gray-300">
                         <div className="flex items-center gap-2">
                            <span>📎</span>
                            <span className="truncate max-w-xs">{file.name}</span>
                         </div>
                         <button onClick={() => setFile(null)} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                )}

                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                    <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-white bg-slate-700 rounded transition-colors"
                        title="Attach file"
                    >
                        📎
                    </button>

                    <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(e);
                            }
                        }}
                        placeholder={replyTo ? "Type your reply..." : "Type a message..."}
                        className="flex-grow bg-slate-900 text-white rounded px-4 py-2 border border-slate-700 focus:outline-none focus:border-blue-500 resize-none min-h-[42px] max-h-32"
                        rows="1"
                    />
                    <button 
                        type="submit" 
                        disabled={uploading}
                        className={`px-4 py-2 rounded font-medium transition-colors ${
                            uploading ? 'bg-blue-800 text-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {uploading ? '...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    )
}
