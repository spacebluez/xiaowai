import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  Bell,
  Lock,
  Palette,
  Globe,
  Zap,
  Shield,
  HelpCircle,
  Info,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import {
  RadioGroup,
  RadioGroupItem,
} from "../components/ui/radio-group";

export function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      updates: false,
      marketing: false,
    },
    theme: "system",
    language: "zh-CN",
    fontSize: 16,
    autoSave: true,
    dataCollection: false,
    betaFeatures: false,
  });

  const handleToggle = (category: string, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as object),
        [key]: !(prev[category as keyof typeof prev] as any)[
          key
        ],
      },
    }));
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const settingSections = [
    {
      title: "通知设置",
      icon: Bell,
      items: [
        {
          id: "email",
          label: "邮件通知",
          description: "接收重要更新和消息的邮件通知",
          type: "toggle",
          category: "notifications",
        },
        {
          id: "push",
          label: "推送通知",
          description: "接收浏览器推送通知",
          type: "toggle",
          category: "notifications",
        },
        {
          id: "updates",
          label: "产品更新",
          description: "接收新功能和改进的通知",
          type: "toggle",
          category: "notifications",
        },
        {
          id: "marketing",
          label: "营销邮件",
          description: "接收产品推广和优惠信息",
          type: "toggle",
          category: "notifications",
        },
      ],
    },
    {
      title: "外观设置",
      icon: Palette,
      items: [
        {
          id: "theme",
          label: "主题",
          description: "选择应用的外观主题",
          type: "radio",
          options: [
            { value: "light", label: "浅色", icon: Sun },
            { value: "dark", label: "深色", icon: Moon },
            {
              value: "system",
              label: "跟随系统",
              icon: Monitor,
            },
          ],
        },
        {
          id: "fontSize",
          label: "字体大小",
          description: "调整界面文字的大小",
          type: "slider",
          min: 12,
          max: 20,
        },
      ],
    },
    {
      title: "语言与区域",
      icon: Globe,
      items: [
        {
          id: "language",
          label: "语言",
          description: "选择应用显示的语言",
          type: "select",
          options: [
            { value: "zh-CN", label: "简体中文" },
            { value: "zh-TW", label: "繁體中文" },
            { value: "en", label: "English" },
            { value: "ja", label: "日本語" },
          ],
        },
      ],
    },
    {
      title: "高级设置",
      icon: Zap,
      items: [
        {
          id: "autoSave",
          label: "自动保存",
          description: "自动保存你的对话内容",
          type: "toggle",
        },
        {
          id: "betaFeatures",
          label: "测试版功能",
          description: "启用实验性功能（可能不稳定）",
          type: "toggle",
        },
      ],
    },
    {
      title: "隐私与安全",
      icon: Shield,
      items: [
        {
          id: "dataCollection",
          label: "数据收集",
          description: "允许收集匿名使用数据以改进产品",
          type: "toggle",
        },
      ],
    },
  ];

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
                设置
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            return (
              <Card
                key={sectionIndex}
                className="p-6 bg-white/80 backdrop-blur"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <SectionIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-base font-medium text-gray-800">
                            {item.label}
                          </Label>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}

                          {/* Radio Group */}
                          {item.type === "radio" &&
                            item.options && (
                              <RadioGroup
                                value={
                                  settings[
                                    item.id as keyof typeof settings
                                  ] as string
                                }
                                onValueChange={(value) =>
                                  handleChange(item.id, value)
                                }
                                className="mt-4"
                              >
                                {item.options.map((option) => {
                                  const OptionIcon =
                                    option.icon;
                                  return (
                                    <div
                                      key={option.value}
                                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                    >
                                      <RadioGroupItem
                                        value={option.value}
                                        id={option.value}
                                      />
                                      {OptionIcon && (
                                        <OptionIcon className="w-4 h-4 text-gray-600" />
                                      )}
                                      <Label
                                        htmlFor={option.value}
                                        className="flex-1 cursor-pointer"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </RadioGroup>
                            )}

                          {/* Select */}
                          {item.type === "select" &&
                            item.options && (
                              <Select
                                value={
                                  settings[
                                    item.id as keyof typeof settings
                                  ] as string
                                }
                                onValueChange={(value) =>
                                  handleChange(item.id, value)
                                }
                              >
                                <SelectTrigger className="w-full mt-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.options.map(
                                    (option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            )}

                          {/* Slider */}
                          {item.type === "slider" && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  小
                                </span>
                                <span className="font-medium text-blue-600">
                                  {settings.fontSize}px
                                </span>
                                <span className="text-gray-600">
                                  大
                                </span>
                              </div>
                              <Slider
                                value={[settings.fontSize]}
                                onValueChange={([value]) =>
                                  handleChange(
                                    "fontSize",
                                    value,
                                  )
                                }
                                min={item.min}
                                max={item.max}
                                step={1}
                              />
                            </div>
                          )}
                        </div>

                        {/* Toggle */}
                        {item.type === "toggle" && (
                          <Switch
                            checked={
                              item.category
                                ? (
                                    settings[
                                      item.category as keyof typeof settings
                                    ] as any
                                  )[item.id]
                                : settings[
                                    item.id as keyof typeof settings
                                  ]
                            }
                            onCheckedChange={() =>
                              item.category
                                ? handleToggle(
                                    item.category,
                                    item.id,
                                  )
                                : handleChange(
                                    item.id,
                                    !settings[
                                      item.id as keyof typeof settings
                                    ],
                                  )
                            }
                          />
                        )}
                      </div>
                      {itemIndex < section.items.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          {/* Additional Options */}
          <Card className="p-6 bg-white/80 backdrop-blur">
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">
                    帮助中心
                  </span>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>

              <Separator />

              <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">
                    关于小歪
                  </span>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>

              <Separator />

              <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">
                    隐私政策
                  </span>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
            </div>
          </Card>

          {/* Version Info */}
          <div className="text-center text-sm text-gray-500 py-4">
            小歪 Xiaowai v1.0.0
            <br />© 2026 All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}