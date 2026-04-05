import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Send,
  Menu,
  Plus,
  MessageSquare,
  User,
  History,
  Settings,
  LogOut,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Bot,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState({
    id: "1",
    name: "通用助手",
    model: "GPT-4",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents = [
    { id: "1", name: "通用助手", model: "GPT-4" },
    { id: "2", name: "代码专家", model: "Claude-3" },
    { id: "3", name: "写作助手", model: "Gemini Pro" },
  ];

  const suggestions = [
    "帮我写一篇关于人工智能的文章",
    "如何提高工作效率？",
    "解释一下量子计算的原理",
    "推荐一些学习编程的方法",
  ];

  const recentChats = [
    { id: "1", title: "关于人工智能的讨论", time: "2小时前" },
    { id: "2", title: "编程学习计划", time: "昨天" },
    { id: "3", title: "创意写作助手", time: "2天前" },
    { id: "4", title: "数据分析建议", time: "3天前" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `这是小歪对"${input}"的回复。在实际应用中，这里会显示AI生成的智能回答。小歪可以帮助你解答问题、提供建议、创作内容等各种任务。`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white border-r border-border flex flex-col overflow-hidden shadow-sm`}
      >
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              小歪
            </span>
          </Link>
        </div>

        <div className="p-4">
          <Button className="w-full justify-start gap-2" variant="outline">
            <Plus className="w-4 h-4" />
            新建对话
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">最近对话</p>
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors duration-200"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground">{chat.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2">
          <Link to="/prompts">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Sparkles className="w-4 h-4" />
              Prompt广场
            </Button>
          </Link>
          <Link to="/agents">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Bot className="w-4 h-4" />
              智能体管理
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <History className="w-4 h-4" />
              历史记录
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="w-4 h-4" />
              设置
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <User className="w-4 h-4" />
              个人资料
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
              退出登录
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-full">
                <Bot className="w-4 h-4" />
                <span>{selectedAgent.name}</span>
                <span className="text-xs text-muted-foreground">({selectedAgent.model})</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 rounded-xl">
              {agents.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={selectedAgent.id === agent.id ? "bg-primary/10" : ""}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{agent.model}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/agents" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  管理智能体
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="w-10"></div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <div ref={messagesEndRef} />
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8 animate-bounce-light">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-6 animate-slide-up">
                你好！我是小歪
              </h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
                我是你的AI智能助手，可以帮助你解答问题、提供建议、创作内容等。
                <br />
                试试下面的问题，或者直接输入你想了解的内容。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-5 bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all-300 text-left animate-scale-in"
                    style={{animationDelay: `${0.2 + index * 0.1}s`}}
                  >
                    <p className="text-foreground">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-slide-up`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-secondary">
                      <AvatarFallback className="bg-transparent">
                        <Sparkles className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] p-5 rounded-2xl ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white border border-border shadow-sm"
                    } transition-all-300 hover:shadow-md`}
                  >
                    <p className={message.role === "user" ? "text-white" : "text-foreground"}>
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="w-10 h-10 bg-muted">
                      <AvatarFallback>
                        <User className="w-5 h-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-slide-up">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-secondary">
                    <AvatarFallback className="bg-transparent">
                      <Sparkles className="w-5 h-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-white p-6 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-background rounded-2xl border-2 border-border focus-within:border-primary transition-colors duration-200">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="min-h-[60px] max-h-[200px] border-0 bg-transparent resize-none focus-visible:ring-0 pr-32"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-9 bg-primary hover:bg-primary/90 rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              小歪可能会出错。请核实重要信息。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}