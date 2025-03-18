"use client";

import { useState, useEffect, useRef, Key } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {v4 as uuidV4} from 'uuid';
import { Separator } from "@/components/ui/separator";

import {postMessage,generateWorklow, getLLMCompletion} from "@/lib/chatAi";
import { TokensList } from "marked";

import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { CornerDownRight, Ellipsis, Plus } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
                        
interface Message {
  id: string;
  user: string;
  content?: string;
  htmlContent?: TokensList;
  timestamp: Date;
  actualContent : string;
}

interface ChatProps {
  setWorkflow: ({nodes,edges}: {nodes:any[],edges:any[]}) => void;
}

const Chat: React.FC<ChatProps> = ({setWorkflow}:ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const newMessage: Message = {
      id: uuidV4(),
      user: "You",
      content: input,
      timestamp: new Date(),
      actualContent: input,
    };

    const newMessages = [...messages, newMessage]

    setMessages(newMessages);
    setInput("");

    // Show a spinner while waiting for the bot reply
    const loadingMessage: Message = {
      id: uuidV4(),
      user: "Bot",
      content: "Typing...",
      timestamp: new Date(),
      actualContent: "Typing..."
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // const result = await postMessage(input,null);
    const result = await getLLMCompletion(newMessages,null);
    if (!result) return;
    
    const { responseMessage, parsedMessage } = result;
    
    setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));
    const reply: Message = {
      id: uuidV4(),
      user: "Bot",
      htmlContent: parsedMessage,
      timestamp: new Date(),
      actualContent: responseMessage,
    };
    setMessages((prev) => [...prev, reply]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleWorkflowGeneration = async (workflowMsg:string) => {
    try{
      toast("Generating workflow", {
        description: "Generating workflow please wait",
      })
  
      const workflow = await generateWorklow(workflowMsg, null);
  
      toast("Generating layout", {
        description: "Workflow generated, running auto layout",
      })
  
      console.log(workflow);
      if (workflow) {
        setWorkflow(workflow);
      }
  
      toast("Workflow generated", {
        description: "Workflow generation complete.",
      })
    }
    catch(e){
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col h-full w-full p-4 border rounded-md shadow-md">
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl font-bold mb-4">Chat</h2>
        <div>
          <Button variant={"outline"} onClick={() => {
            setMessages([]);
            setInput("")
          }}>
            <Plus/>
          </Button>
        </div>
      </div>
      <Separator orientation="horizontal" className="w-full mb-4"/>
      <ScrollArea className="flex-1 mb-4">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.user === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xl px-4 py-2 rounded-lg ${
                  msg.user === "You"
                    ? "bg-primary text-secondary"
                    : "bg-secondary text-primary"
                }`}
                key={uuidV4()}
              >

                {msg.content && (
                  <p className="text-sm" key={uuidV4()}>{msg.content}</p>
                )}
                
                {
                  msg.htmlContent && msg.htmlContent.map(e => {

                    let content;

                    switch(e.type) {
                      case "paragraph":
                        content = (
                          <p className="text-sm py-2" key={uuidV4()}>
                              {e.tokens?.map((token, index) => {
                                  switch (token.type) {
                                      case "text":
                                          return token.text;
                                      case "strong":
                                          return <strong key={index}>{token.text}</strong>;
                                      case "em":
                                          return <em key={index}>{token.text}</em>;
                                  }
                              })}
                          </p>
                        )
                        break;

                      case "space":
                        content = (<span className="h-2" key={uuidV4()}></span>)
                        break;

                      case "heading":
                        content = (<p className="text-md py-2" key={uuidV4()}>{e.text}</p>)
                        break;

                      case "list":
                        content = (
                          <ul key={uuidV4()}>
                            {
                              e.items.map((listItem:any) => {
                                return (<li className="text-sm py-2" key={uuidV4()}>{listItem.text}</li>)
                              })
                            }
                          </ul>
                        )
                        break;

                      case "table":
                        content = (
                          <ChatTable headers={e.header} rows={e.rows}/>
                        )
                        break;
                        


                      default:
                        content = (<></>);
                        break;
                    }

                    return content;
                  })
                }

                <span className="text-xs flex mt-1 items-center justify-between">
                  {/* Left side: one or more action buttons */}
                  <span className="flex gap-2">
                    {(msg.actualContent && msg.user === "Bot" && msg.actualContent !== "Typing...") && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-primary-foreground"
                        onClick={async () => {
                            if(msg.actualContent){
                              handleWorkflowGeneration(msg.actualContent)
                            }
                            
                            return;
                          }
                        }
                      >
                        <CornerDownRight />
                      </Button>
                    )}
                    {/* Add additional action buttons here if needed */}
                  </span>

                  {/* Right side: timestamp */}
                  <span>
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </span>
                
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="flex flex-col gap-2">
        {/* <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        /> */}
        <Textarea 
          placeholder="Type your message here." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          onKeyDown={handleKeyPress}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};


const ChatTable = ({headers,rows}: {headers:any,rows:any}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-primary-foreground hover:bg-primary-foreground my-2">
          {
            headers.map((e:any) => {
              return <TableHead>{e.text}</TableHead>
            })
          }
        </TableRow>
      </TableHeader>
      <TableBody >
        {
          rows.map((row: any) => {
            return (
              <TableRow key={uuidV4()} className="hover:bg-primary-foreground border-primary-foreground">
                {
                  row.map((rowItem:any) => {
                    return <TableCell className="">{rowItem.text}</TableCell>
                  })
                }
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  )
}


export default Chat;
