import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  Search,
  Heart,
  Copy,
  Download,
  Share2,
  Plus,
  TrendingUp,
  Clock,
  Star,
  Filter,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  author: string;
  category: string;
  likes: number;
  downloads: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
}

export function PromptSquare() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: "1",
      title: "专业文案撰写助手",
      content: "你是一位资深的文案撰写专家，擅长创作吸引人的营销文案。请根据用户提供的产品信息，撰写一段简洁有力、富有感染力的文案，突出产品的核心优势和独特卖点。",
      description: "帮助你快速生成专业的营销文案",
      author: "张三",
      category: "营销",
      likes: 234,
      downloads: 567,
      isLiked: false,
      createdAt: "2026-04-03",
      tags: ["营销", "文案", "创意"],
    },
    {
      id: "2",
      title: "代码审查专家",
      content: "你是一位经验丰富的代码审查专家。请仔细审查用户提交的代码，从代码质量、性能优化、安全性、可维护性等多个维度提供专业的改进建议。每条建议都应该具体、可操作，并说明原因。",
      description: "专业的代码审查和优化建议",
      author: "李四",
      category: "编程",
      likes: 189,
      downloads: 423,
      isLiked: true,
      createdAt: "2026-04-02",
      tags: ["编程", "代码审查", "优化"],
    },
    {
      id: "3",
      title: "英语学习导师",
      content: "你是一位专业的英语教师，擅长用简单易懂的方式讲解英语知识。请针对用户的英语水平，提供个性化的学习建议，包括语法讲解、词汇扩展、口语练习等。使用大量实例帮助用户理解和记忆。",
      description: "个性化的英语学习指导",
      author: "王五",
      category: "教育",
      likes: 312,
      downloads: 789,
      isLiked: false,
      createdAt: "2026-04-01",
      tags: ["教育", "英语", "学习"],
    },
    {
      id: "4",
      title: "数据分析助手",
      content: "你是一位数据分析专家，擅长从数据中挖掘洞察。请分析用户提供的数据，识别关键趋势和模式，提供可视化建议，并给出基于数据的业务建议。用清晰的语言解释复杂的统计概念。",
      description: "专业的数据分析和洞察",
      author: "赵六",
      category: "数据",
      likes: 156,
      downloads: 334,
      isLiked: false,
      createdAt: "2026-03-31",
      tags: ["数据", "分析", "可视化"],
    },
    {
      id: "5",
      title: "创意故事生成器",
      content: "你是一位富有想象力的作家。请根据用户提供的主题、人物或场景，创作一个引人入胜的故事。故事应该有清晰的开端、发展和结局，人物性格鲜明，情节跌宕起伏。",
      description: "激发创意，生成精彩故事",
      author: "孙七",
      category: "创作",
      likes: 445,
      downloads: 891,
      isLiked: true,
      createdAt: "2026-03-30",
      tags: ["创作", "故事", "创意"],
    },
    {
      id: "6",
      title: "面试准备教练",
      content: "你是一位资深的职业规划师和面试教练。请帮助用户准备面试，包括常见问题的回答技巧、如何展示自己的优势、如何应对压力面试等。提供具体的示例和建议。",
      description: "助你顺利通过面试",
      author: "周八",
      category: "职场",
      likes: 278,
      downloads: 612,
      isLiked: false,
      createdAt: "2026-03-29",
      tags: ["职场", "面试", "职业发展"],
    },
  ]);

  const [newPrompt, setNewPrompt] = useState({
    title: "",
    content: "",
    description: "",
    category: "",
    tags: "",
  });

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "trending") return matchesSearch;
    if (activeTab === "latest") return matchesSearch;
    if (activeTab === "liked") return matchesSearch && prompt.isLiked;

    return matchesSearch;
  });

  const sortedPrompts =
    activeTab === "trending"
      ? [...filteredPrompts].sort((a, b) => b.likes - a.likes)
      : activeTab === "latest"
      ? [...filteredPrompts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : filteredPrompts;

  const handleLike = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleCopy = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`已复制"${title}"到剪贴板`);
  };

  const handleDownload = (prompt: Prompt) => {
    const content = `标题：${prompt.title}\n\n描述：${prompt.description}\n\n内容：\n${prompt.content}\n\n作者：${prompt.author}\n分类：${prompt.category}\n标签：${prompt.tags.join(", ")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setPrompts((prev) =>
      prev.map((p) => (p.id === prompt.id ? { ...p, downloads: p.downloads + 1 } : p))
    );
    toast.success(`已下载"${prompt.title}"`);
  };

  const handleCreatePrompt = () => {
    if (!newPrompt.title || !newPrompt.content || !newPrompt.description) {
      toast.error("请填写所有必填字段");
      return;
    }

    const prompt: Prompt = {
      id: Date.now().toString(),
      title: newPrompt.title,
      content: newPrompt.content,
      description: newPrompt.description,
      author: "我",
      category: newPrompt.category || "其他",
      likes: 0,
      downloads: 0,
      isLiked: false,
      createdAt: new Date().toISOString().split("T")[0],
      tags: newPrompt.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    setPrompts((prev) => [prompt, ...prev]);
    setNewPrompt({ title: "", content: "", description: "", category: "", tags: "" });
    toast.success("提示词已发布到广场！");
  };

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
                Prompt广场
              </span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                分享提示词
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>分享你的提示词</DialogTitle>
                <DialogDescription>
                  与社区分享你的优质提示词，帮助更多人提升AI使用体验
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题 *</Label>
                  <Input
                    id="title"
                    placeholder="给你的提示词起个名字"
                    value={newPrompt.title}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">描述 *</Label>
                  <Input
                    id="description"
                    placeholder="简短描述这个提示词的用途"
                    value={newPrompt.description}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">提示词内容 *</Label>
                  <Textarea
                    id="content"
                    placeholder="输入完整的提示词内容..."
                    rows={6}
                    value={newPrompt.content}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({ ...prev, content: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">分类</Label>
                    <Input
                      id="category"
                      placeholder="如：编程、营销、教育"
                      value={newPrompt.category}
                      onChange={(e) =>
                        setNewPrompt((prev) => ({ ...prev, category: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">标签</Label>
                    <Input
                      id="tags"
                      placeholder="用逗号分隔，如：创意,文案"
                      value={newPrompt.tags}
                      onChange={(e) =>
                        setNewPrompt((prev) => ({ ...prev, tags: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreatePrompt}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  发布到广场
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索提示词..."
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
              <TabsTrigger value="trending">
                <TrendingUp className="w-4 h-4 mr-2" />
                热门
              </TabsTrigger>
              <TabsTrigger value="latest">
                <Clock className="w-4 h-4 mr-2" />
                最新
              </TabsTrigger>
              <TabsTrigger value="liked">
                <Heart className="w-4 h-4 mr-2" />
                我的收藏
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="p-6 bg-white/80 backdrop-blur hover:shadow-xl transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{prompt.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {prompt.description}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex-1">
                <p className="text-xs text-gray-700 line-clamp-4">{prompt.content}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{prompt.category}</Badge>
                {prompt.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>@{prompt.author}</span>
                <span>{new Date(prompt.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLike(prompt.id)}
                  className={prompt.isLiked ? "text-red-500 border-red-500" : ""}
                >
                  <Heart
                    className={`w-4 h-4 mr-1 ${
                      prompt.isLiked ? "fill-red-500" : ""
                    }`}
                  />
                  {prompt.likes}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(prompt.content, prompt.title)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(prompt)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {sortedPrompts.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">没有找到相关提示词</p>
          </div>
        )}
      </div>
    </div>
  );
}
