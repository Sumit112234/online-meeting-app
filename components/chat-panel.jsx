"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, X } from "lucide-react"
import { useChat } from "@/hooks/use-chat"

export function ChatPanel({ meetingId, currentUser, onClose }) {
  const { messages, loading, sendMessage } = useChat(meetingId, currentUser)
  const [inputText, setInputText] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || sending) return

    setSending(true)
    await sendMessage(inputText)
    setInputText("")
    setSending(false)
  }

  return (
    <Card className="h-full flex flex-col shadow-2xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chat</CardTitle>
            <CardDescription>{messages.length} messages</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === currentUser?.uid
                return (
                  <div key={message.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {message.senderName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
                      {!isOwn && <span className="text-xs text-muted-foreground mb-1">{message.senderName}</span>}
                      <div
                        className={`rounded-lg px-4 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <p className="text-sm break-words">{message.text}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-4">
        <form onSubmit={handleSend} className="flex gap-2 w-full">
          <Input
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={sending || !inputText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
