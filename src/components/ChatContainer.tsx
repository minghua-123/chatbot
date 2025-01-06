'use client';

import { useChat } from 'ai/react';

import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button';

type Props = {}

const ChatContainer = (props: Props) => {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '/api/chat',
    })

    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className='h-full w-full flex flex-col'>
            {/* messages */}
            <div className='flex-1 flex flex-col gap-2 h-full overflow-auto'>
                {messages.map(message => (
                    <div key={message.id} className={`p-2 flex flex-row ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`text-sm inline-block break-words whitespace-pre-wrap max-w-[80%] bg-white p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100 ' : 'bg-white'}`}>
                            {message.content}
                        </p>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>

            {/* input */}
            <form
                className='flex flex-row gap-2 p-2 h-20 justify-center'
                onSubmit={handleSubmit}
            >
                <input
                    className='flex-1 rounded-lg p-2'
                    name="prompt" value={input} onChange={handleInputChange} />
                <Button type="submit" className='h-full'>Submit</Button>
            </form>
        </div>
    );
}
export default ChatContainer