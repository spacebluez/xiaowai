import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  Plus,
  Bot,
  Edit,
  Trash2,
  Copy,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  provider: string;
  apiKey: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  isDefault: boolean;
}

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "通用助手",
      description: "适用于各种日常任务的通用AI助手",
      model: "gpt-4",
      provider: "OpenAI",
      apiKey: "sk-**********************",
      systemPrompt: "你是一个友好、专业的AI助手，致力于帮助用户解决问题。",
      temperature: 0.7,
      maxTokens: 2000,
      createdAt: "2026-04-01",
      isDefault: true,
    },
    {
      id: "2",
      name: "代码专家",
      description: "专门用于编程和代码审查的AI助手",
      model: "claude-3-opus",
      provider: "Anthropic",
      apiKey: "sk-**********************",
      systemPrompt:
        "你是一位资深的软件工程师，擅长代码编写、审查和优化。请提供高质量的代码建议，并解释你的思路。",
      temperature: 0.3,
      maxTokens: 4000,
      createdAt: "2026-03-28",
      isDefault: false,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "",
    provider: "",
    apiKey: "",
    systemPrompt: "",
    temperature: "0.7",
    maxTokens: "2000",
  });

  const providers = [
    { value: "OpenAI", label: "OpenAI", models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"] },
    { value: "Anthropic", label: "Anthropic", models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"] },
    { value: "Google", label: "Google", models: ["gemini-pro", "gemini-pro-vision"] },
    { value: "Qwen", label: "通义千问", models: ["qwen-turbo", "qwen-plus", "qwen-max"] },
    { value: "Zhipu", label: "智谱AI", models: ["glm-4", "glm-3-turbo"] },
    { value: "Baichuan", label: "百川智能", models: ["Baichuan2-Turbo", "Baichuan2-53B"] },
  ];

  const handleCreate = () => {
    if (!formData.name || !formData.provider || !formData.model || !formData.apiKey) {
      toast.error("请填写所有必填字段");
      return;
    }

    const newAgent: Agent = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      model: formData.model,
      provider: formData.provider,
      apiKey: formData.apiKey,
      systemPrompt: formData.systemPrompt,
      temperature: parseFloat(formData.temperature),
      maxTokens: parseInt(formData.maxTokens),
      createdAt: new Date().toISOString().split("T")[0],
      isDefault: agents.length === 0,
    };

    setAgents((prev) => [...prev, newAgent]);
    resetForm();
    setIsCreating(false);
    toast.success("智能体创建成功！");
  };

  const handleUpdate = () => {
    if (!editingAgent || !formData.name || !formData.provider || !formData.model || !formData.apiKey) {
      toast.error("请填写所有必填字段");
      return;
    }

    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === editingAgent.id
          ? {
              ...agent,
              name: formData.name,
              description: formData.description,
              model: formData.model,
              provider: formData.provider,
              apiKey: formData.apiKey,
              systemPrompt: formData.systemPrompt,
              temperature: parseFloat(formData.temperature),
              maxTokens: parseInt(formData.maxTokens),
            }
          : agent
      )
    );

    resetForm();
    setEditingAgent(null);
    toast.success("智能体更新成功！");
  };

  const handleDelete = (id: string) => {
    if (agents.find((a) => a.id === id)?.isDefault && agents.length > 1) {
      const newDefault = agents.find((a) => a.id !== id);
      if (newDefault) {
        setAgents((prev) =>
          prev.filter((a) => a.id !== id).map((a) => (a.id === newDefault.id ? { ...a, isDefault: true } : a))
        );
      }
    } else {
      setAgents((prev) => prev.filter((a) => a.id !== id));
    }
    toast.success("智能体已删除");
  };

  const handleSetDefault = (id: string) => {
    setAgents((prev) =>
      prev.map((agent) => ({ ...agent, isDefault: agent.id === id }))
    );
    toast.success("默认智能体已更新");
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      model: agent.model,
      provider: agent.provider,
      apiKey: agent.apiKey,
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature.toString(),
      maxTokens: agent.maxTokens.toString(),
    });
  };

  const handleDuplicate = (agent: Agent) => {
    const newAgent: Agent = {
      ...agent,
      id: Date.now().toString(),
      name: `${agent.name} (副本)`,
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAgents((prev) => [...prev, newAgent]);
    toast.success("智能体已复制");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      model: "",
      provider: "",
      apiKey: "",
      systemPrompt: "",
      temperature: "0.7",
      maxTokens: "2000",
    });
  };

  const openDialog = () => {
    resetForm();
    setEditingAgent(null);
    setIsCreating(true);
  };

  const selectedProvider = providers.find((p) => p.value === formData.provider);

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
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                智能体管理
              </span>
            </div>
          </div>

          <Dialog open={isCreating || !!editingAgent} onOpenChange={(open) => {
            if (!open) {
              setIsCreating(false);
              setEditingAgent(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={openDialog} className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                创建智能体
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAgent ? "编辑智能体" : "创建新智能体"}</DialogTitle>
                <DialogDescription>
                  配置AI模型和系统提示词，创建专属的智能助手
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">名称 *</Label>
                    <Input
                      id="name"
                      placeholder="给智能体起个名字"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider">模型厂商 *</Label>
                    <Select
                      value={formData.provider}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, provider: value, model: "" }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择厂商" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Input
                    id="description"
                    placeholder="简短描述这个智能体的用途"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">模型 *</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, model: value }))
                      }
                      disabled={!formData.provider}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择模型" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProvider?.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key *</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-**********************"
                      value={formData.apiKey}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">系统提示词（默认提示词）</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="设置智能体的默认行为和角色..."
                    rows={6}
                    value={formData.systemPrompt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))
                    }
                  />
                  <p className="text-xs text-gray-500">
                    系统提示词会在每次对话开始时自动应用，定义智能体的角色和行为方式
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (0-1)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, temperature: e.target.value }))
                      }
                    />
                    <p className="text-xs text-gray-500">
                      控制输出的随机性，越高越有创意
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">最大Token数</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="100"
                      max="8000"
                      step="100"
                      value={formData.maxTokens}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, maxTokens: e.target.value }))
                      }
                    />
                    <p className="text-xs text-gray-500">限制单次回复的长度</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingAgent(null);
                    resetForm();
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={editingAgent ? handleUpdate : handleCreate}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  {editingAgent ? "更新" : "创建"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">我的智能体</h2>
          <p className="text-gray-600">
            管理你的AI智能体，配置不同的模型和提示词以适应不同场景
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="p-6 bg-white/80 backdrop-blur hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      {agent.name}
                      {agent.isDefault && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">
                          默认
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{agent.provider}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {agent.description || "暂无描述"}
              </p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">模型：</span>
                  <span className="text-gray-700 font-medium">{agent.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Temperature：</span>
                  <span className="text-gray-700">{agent.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Tokens：</span>
                  <span className="text-gray-700">{agent.maxTokens}</span>
                </div>
              </div>

              {agent.systemPrompt && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">系统提示词：</p>
                  <p className="text-xs text-gray-700 line-clamp-3">
                    {agent.systemPrompt}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!agent.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(agent.id)}
                  >
                    设为默认
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(agent)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(agent)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(agent.id)}
                  disabled={agents.length === 1}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                创建于 {new Date(agent.createdAt).toLocaleDateString("zh-CN")}
              </div>
            </Card>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-16">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">还没有创建智能体</p>
            <Button
              onClick={openDialog}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建第一个智能体
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
