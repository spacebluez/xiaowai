import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Camera,
  Save,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "张三",
    email: "zhangsan@example.com",
    phone: "+86 138 0000 0000",
    location: "中国，北京",
    bio: "热爱科技和AI的产品经理，致力于用技术改变世界。",
    joinDate: "2024年1月",
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const stats = [
    { label: "对话次数", value: "1,234" },
    { label: "使用天数", value: "92" },
    { label: "收藏内容", value: "45" },
    { label: "分享次数", value: "18" },
  ];

  const achievements = [
    { name: "早期用户", icon: "🌟", description: "成为前100名用户" },
    { name: "活跃用户", icon: "🔥", description: "连续使用30天" },
    { name: "探索者", icon: "🚀", description: "尝试所有功能" },
    { name: "创作者", icon: "✨", description: "创建100个对话" },
  ];

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/chat">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                个人资料
              </span>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-full transition-colors duration-200">
              <Edit className="w-4 h-4 mr-2" />
              编辑资料
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button onClick={handleCancel} variant="outline" className="rounded-full transition-colors duration-200">
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-full transition-colors duration-200">
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <Card className="p-8 mb-8 bg-white shadow-lg rounded-2xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <Avatar className="w-32 h-32 bg-gradient-to-br from-primary to-secondary">
                  <AvatarFallback className="text-4xl text-white bg-transparent">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
              <Badge className="mt-4 bg-primary hover:bg-primary/90 transition-colors duration-200">
                高级会员
              </Badge>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-foreground">姓名</Label>
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="rounded-xl border-border focus:border-primary transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-foreground">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="rounded-xl border-border focus:border-primary transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-foreground">电话</Label>
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="rounded-xl border-border focus:border-primary transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-foreground">位置</Label>
                    <Input
                      id="location"
                      value={editedProfile.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="rounded-xl border-border focus:border-primary transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="bio" className="text-foreground">个人简介</Label>
                    <Textarea
                      id="bio"
                      value={editedProfile.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      rows={3}
                      className="rounded-xl border-border focus:border-primary transition-colors duration-200"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      {profile.name}
                    </h2>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="w-5 h-5" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="w-5 h-5" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                      <span>加入于 {profile.joinDate}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-6 mb-8 bg-white shadow-lg rounded-2xl">
          <h3 className="font-semibold text-foreground mb-6">使用统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-background hover:shadow-md transition-all duration-300">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6 mb-8 bg-white shadow-lg rounded-2xl">
          <h3 className="font-semibold text-foreground mb-6">成就徽章</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="text-4xl">{achievement.icon}</div>
                <div>
                  <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Separator className="my-8" />

        {/* Danger Zone */}
        <Card className="p-6 bg-white shadow-lg rounded-2xl border-destructive/20">
          <h3 className="font-semibold text-destructive mb-6">危险区域</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-background">
              <div>
                <p className="font-medium text-foreground">导出数据</p>
                <p className="text-sm text-muted-foreground mt-1">下载你的所有对话和数据</p>
              </div>
              <Button variant="outline" className="rounded-full transition-colors duration-200">导出</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between p-4 rounded-xl bg-background">
              <div>
                <p className="font-medium text-foreground">删除账户</p>
                <p className="text-sm text-muted-foreground mt-1">永久删除你的账户和所有数据</p>
              </div>
              <Button variant="destructive" className="rounded-full transition-colors duration-200">删除</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}