import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  Search,
  Calendar,
  MessageSquare,
  Trash2,
  Star,
  MoreVertical,
  Filter,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
  isFavorite: boolean;
  category: string;
}

export function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const chatHistory: ChatHistory[] = [
    {
      id: "1",
      title: "关于人工智能的深入讨论",
      preview: "我们讨论了AI在医疗、教育和交通领域的应用...",
      date: "2026-04-04",
      messageCount: 24,
      isFavorite: true,
      category: "技术",
    },
    {
      id: "2",
      title: "创意写作：科幻小说大纲",
      preview: "帮我构思了一个关于未来世界的科幻故事...",
      date: "2026-04-03",
      messageCount: 18,
      isFavorite: false,
      category: "创作",
    },
    {
      id: "3",
      title: "Python编程学习计划",
      preview: "制定了一个为期三个月的Python学习路线...",
      date: "2026-04-02",
      messageCount: 32,
      isFavorite: true,
      category: "编程",
    },
    {
      id: "4",
      title: "健康生活方式建议",
      preview: "提供了关于饮食、运动和睡眠的专业建议...",
      date: "2026-04-01",
      messageCount: 15,
      isFavorite: false,
      category: "生活",
    },
    {
      id: "5",
      title: "数据分析报告解读",
      preview: "帮助分析了销售数据并提供了改进建议...",
      date: "2026-03-31",
      messageCount: 28,
      isFavorite: false,
      category: "工作",
    },
    {
      id: "6",
      title: "旅行规划：日本之旅",
      preview: "详细规划了东京、京都和大阪的行程...",
      date: "2026-03-30",
      messageCount: 21,
      isFavorite: true,
      category: "旅行",
    },
  ];

  const filteredHistory = chatHistory.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "favorites") return matchesSearch && chat.isFavorite;
    return matchesSearch;
  });

  const groupByDate = (chats: ChatHistory[]) => {
    const groups: { [key: string]: ChatHistory[] } = {
      今天: [],
      昨天: [],
      本周: [],
      本月: [],
      更早: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.date);
      const today = new Date("2026-04-04");
      const diffDays = Math.floor(
        (today.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) groups["今天"].push(chat);
      else if (diffDays === 1) groups["昨天"].push(chat);
      else if (diffDays <= 7) groups["本周"].push(chat);
      else if (diffDays <= 30) groups["本月"].push(chat);
      else groups["更早"].push(chat);
    });

    return groups;
  };

  const groupedHistory = groupByDate(filteredHistory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/chat">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                历史记录
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索对话..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="favorites">收藏</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* History List */}
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(
            ([period, chats]) =>
              chats.length > 0 && (
                <div key={period}>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {period}
                  </h3>
                  <div className="space-y-3">
                    {chats.map((chat) => (
                      <Card
                        key={chat.id}
                        className="p-5 bg-white/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <Link to={`/chat/${chat.id}`} className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-800 truncate">
                                    {chat.title}
                                  </h4>
                                  {chat.isFavorite && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                  {chat.preview}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>{chat.messageCount} 条消息</span>
                                  <span>•</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {chat.category}
                                  </Badge>
                                  <span>•</span>
                                  <span>
                                    {new Date(chat.date).toLocaleDateString("zh-CN")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Star className="w-4 h-4 mr-2" />
                                {chat.isFavorite ? "取消收藏" : "添加收藏"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                继续对话
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
          )}

          {filteredHistory.length === 0 && (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">没有找到相关对话</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}