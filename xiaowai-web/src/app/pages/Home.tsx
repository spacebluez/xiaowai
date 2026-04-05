import { Link } from "react-router-dom";
import { Sparkles, MessageSquare, Lightbulb, Code, Image, Zap, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: "智能对话",
      description: "与小歪进行自然流畅的对话，获得准确的回答和建议",
    },
    {
      icon: Lightbulb,
      title: "创意灵感",
      description: "激发创造力，帮助你构思想法和解决问题",
    },
    {
      icon: Code,
      title: "编程助手",
      description: "提供代码建议、调试帮助和技术指导",
    },
    {
      icon: Image,
      title: "多模态理解",
      description: "理解文本、图像等多种形式的内容",
    },
  ];

  const suggestions = [
    "帮我写一封专业的邮件",
    "解释量子计算的基本原理",
    "创建一个待办事项清单",
    "推荐一些提高效率的方法",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              小歪 Xiaowai
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">登录</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90">
                开始使用
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground mb-8 animate-fade-in">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">AI智能助手</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight animate-slide-up">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            你的智能伙伴
          </span>
          <br />
          <span className="text-foreground">随时为你服务</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
          小歪是你的AI助手，能够理解你的需求，提供智能回答，
          帮助你提升工作效率，激发创造力
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <Link to="/chat">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 transition-all-300">
              <Sparkles className="w-5 h-5 mr-2" />
              开始对话
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 transition-all-300">
              了解更多
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Suggestion Cards */}
        <div className="max-w-4xl mx-auto mb-20 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <p className="text-sm text-muted-foreground mb-6 text-center">试试这些问题</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <Link key={index} to="/chat">
                <Card className="p-5 hover:shadow-lg transition-all-300 cursor-pointer border-2 border-transparent hover:border-primary/20 bg-white animate-scale-in" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                  <p className="text-foreground">{suggestion}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 bg-muted/50 rounded-3xl mx-4">
        <h2 className="text-3xl font-bold text-center mb-16 text-foreground animate-slide-up">
          强大的功能，无限可能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-xl transition-all-300 bg-white border-none animate-slide-up" style={{animationDelay: `${0.2 + index * 0.1}s`}}>
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-6">准备好开始了吗？</h2>
          <p className="text-lg mb-8 text-white/90">
            加入数千名用户，体验AI带来的便利与创新
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
              免费注册
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-muted-foreground">© 2026 小歪 Xiaowai. All rights reserved.</span>
            </div>
            <div className="flex gap-8 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">关于</a>
              <a href="#" className="hover:text-primary transition-colors">隐私政策</a>
              <a href="#" className="hover:text-primary transition-colors">服务条款</a>
              <a href="#" className="hover:text-primary transition-colors">联系我们</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
