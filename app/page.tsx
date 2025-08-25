"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ArrowRight, Phone, Mail, MapPin, Menu, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

export default function Home() {
  const [activeSection, setActiveSection] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiConversationId, setAiConversationId] = useState<string | null>(null)
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([])
  const [aiInput, setAiInput] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const aiMessagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [aiMessages, isAiLoading])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('消息发送成功！我们会尽快与您联系。')
        setFormData({ name: '', email: '', message: '' })
      } else {
        toast.error('发送失败，请稍后再试。')
      }
    } catch (error) {
      toast.error('发送失败，请稍后再试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAiSubmit = async (api: string, query: string) => {
    setIsAiLoading(true)
    try {
      const response = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: query,
          response_mode: "streaming",
          conversation_id: aiConversationId,
          user: "mstech-user"
        }),
      })

      if (response.ok && response.body) {
        // 处理SSE流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedContent = '';
        let conversationId = aiConversationId;
        
        // 添加一个空的AI消息占位符
        setAiMessages(prev => [...prev, { role: 'ai', content: '' }]);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                // 更新对话ID
                if (data.conversation_id && !conversationId) {
                  conversationId = data.conversation_id;
                  setAiConversationId(conversationId);
                }
                
                // 累积内容
                if (data.answer) {
                  accumulatedContent += data.answer;
                  
                  // 更新AI消息内容
                  setAiMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === 'ai') {
                      newMessages[newMessages.length - 1] = {
                        ...lastMessage,
                        content: accumulatedContent
                      };
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // 忽略解析错误
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }
      } else {
        toast.error('AI服务请求失败，请稍后再试。')
      }
    } catch (error) {
      toast.error('AI服务请求失败，请稍后再试。')
    } finally {
      setIsAiLoading(false)
    }
  }

  const solutions = [
    {
      title: "R Shiny全栈解决方案",
      description: "Shiny Server容器化部署，CDISC/SDTM数据转换，临床报表生成，提速300%",
      icon: "📊",
    },
    {
      title: "AI医疗系统开发",
      description: "数字医生平台，多轮问诊智能分诊，RAG知识库集成2000+医学文献",
      icon: "🤖",
    },
    {
      title: "统计分析与培训",
      description: "AI增强分析，LLM模型优化，R包开发培训，Pharmaverse生态实战",
      icon: "📈",
    },
    {
      title: "合规保障服务",
      description: "FDA认可R Consortium试点，GxP验证，friskmetric风险评估",
      icon: "✅",
    },
  ]

  const cases = [
    {
      title: "同济医院-男科数字医生平台",
      description: "AI Agent + RAG知识库，隐私保护架构，患者自助问诊效率提升50%，科研数据沉淀量增长200%",
      image: "/doctor.png?height=400&width=600",
    },
    {
      title: "医渡科技-R平台升级",
      description: "替代SAS搭建Shiny可视化平台，SDTM→ADaM自动转换，开发周期从3个月缩短至2周，年度IT成本下降60%",
      image: "/shiny.png?height=400&width=600",
    },
    {
      title: "清华大学统计中心-网页前端搭建服务",
      description: "构建生物医药知识图谱及搜索引擎开发，实现医药文献智能检索和知识关联分析",
      image: "/medical.png?height=400&width=600",
    },
  ]

  const aiCases = [
    {
      title: "AI男科医生案例",
      description: "基于Dify平台开发的AI男科医生，提供智能问诊服务",
      api: "app-6P3BiitCyWEB1YWmFMez56pD",
    },
  ]

  return (
    <div className="relative">
      {/* 导航栏 */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrollY > 50 ? "bg-white shadow-md py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-primary">
              MS<span className="text-blue-600">TECH</span>
            </div>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#home" className="font-medium hover:text-primary transition-colors">
              首页
            </Link>
            <Link href="#about" className="font-medium hover:text-primary transition-colors">
              关于我们
            </Link>
            <Link href="#solutions" className="font-medium hover:text-primary transition-colors">
              解决方案
            </Link>
            <Link href="#ai-experience" className="font-medium hover:text-primary transition-colors">
              成功案例
            </Link>
            <Link href="#ai-experience-1" className="font-medium hover:text-primary transition-colors">
              AI案例体验
            </Link>
            <Link href="#contact" className="font-medium hover:text-primary transition-colors">
              联系我们
            </Link>
            <Button
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              预约咨询
            </Button>
          </nav>

          {/* 移动端菜单按钮 */}
          <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 移动端导航菜单 */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                <Link
                  href="#home"
                  className="font-medium py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  首页
                </Link>
                <Link
                  href="#about"
                  className="font-medium py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  关于我们
                </Link>
                <Link
                  href="#solutions"
                  className="font-medium py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  解决方案
                </Link>
                <Link
                  href="#ai-experience"
                  className="font-medium py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  成功案例
                </Link>
                <Link
                  href="#ai-experience-1"
                  className="font-medium py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  AI案例
                </Link>
                <Link
                  href="#contact"
                  className="font-medium py-2 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  联系我们
                </Link>
                <Button
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  预约咨询
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 首页 */}
      <section id="home" className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-600/80 z-10" />
          <Image
            src="/lims-for-biotech.jpg"
            alt="MSTECH背景"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              医疗数据智能化，
              <br />
              科研分析新引擎
            </h1>
            <p className="text-xl text-white/90 mb-8">
              MSTECH专注医疗大数据与AI技术融合，
              <br />
              为医院、药企提供R Shiny平台和智能分析解决方案
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 bg-transparent"
              >
                联系我们
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}>
            <a href="#about" className="text-white flex flex-col items-center">
              <span className="mb-2">向下滚动</span>
              <ChevronRight className="rotate-90" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* 关于我们 */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              关于我们
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              MSTECH成立于2015年，是一家专注于科技创新的高新技术企业，致力于为各行业客户提供智能化解决方案
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-lg overflow-hidden"
            >
              <Image src="/core-team.jpg?height=800&width=600" alt="MSTECH团队" fill className="object-cover" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">核心团队</h3>
              <p className="text-gray-600 mb-6">
                汇聚哈佛大学、香港科技大学等顶尖学府专家，专注医疗大数据与AI技术15年+，为医疗行业数字化转型提供专业技术支撑。
              </p>

              <div className="space-y-6 mb-8">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h4 className="font-bold text-lg">杨博士 | 创始人 & 首席科学家</h4>
                  <p className="text-sm text-gray-600">哈佛大学生物统计博士后 | 深圳市海外高层次人才</p>
                  <p className="text-sm text-gray-500 mt-1">专注医疗大数据15年+，主导药物临床试验统计咨询</p>
                </div>

                <div className="border-l-4 border-blue-600 pl-4">
                  <h4 className="font-bold text-lg">伍博士 | AI技术顾问</h4>
                  <p className="text-sm text-gray-600">香港科技大学AI专家 | 金融科技实验室技术骨干</p>
                  <p className="text-sm text-gray-500 mt-1">AI自动研报系统、政策检索知识库（专利/软著10+项）</p>
                </div>

                <div className="border-l-4 border-blue-600 pl-4">
                  <h4 className="font-bold text-lg">陈经理 硕士 | 数据项目经理</h4>
                  <p className="text-sm text-gray-600">香港浸会大学金融统计 | CDISC/SDTM认证专家</p>
                  <p className="text-sm text-gray-500 mt-1">成功交付哈佛医学院、清华大学临床数据平台</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">15+</span>
                  </div>
                  <div>
                    <p className="font-medium">数据驱动的行业经验</p>
                    <p className="text-sm text-gray-500">超过 15 年医疗与生物医药领域经验，熟悉行业痛点与合规要求</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">50+</span>
                  </div>
                  <div>
                    <p className="font-medium">AI 技术探索与应用</p>
                    <p className="text-sm text-gray-500">积极引入 NLP、知识图谱等 AI 技术，用于数据挖掘与智能化分析</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">GxP</span>
                  </div>
                  <div>
                    <p className="font-medium">数据驱动的行业经验</p>
                    <p className="text-sm text-gray-500">深谙 GxP、CDISC、HIPAA 等国际标准，确保数据处理安全与合规</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">20+</span>
                  </div>
                  <div>
                    <p className="font-medium">跨领域整合与定制化方案</p>
                    <p className="text-sm text-gray-500">结合行业知识与新兴技术，为客户提供定制化数字化转型方案</p>
                  </div>
                </div>
              </div>


            </motion.div>
          </div>
        </div>
      </section>

      {/* 解决方案 */}
      <section id="solutions" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              解决方案
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              我们提供全方位的科技解决方案，满足不同行业、不同规模企业的多样化需求
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>

              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI案例体验 */}
      <section id="ai-experience" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              成功案例
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              我们已为众多行业领先企业提供了专业的技术解决方案，助力客户实现业务增长
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cases.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg overflow-hidden shadow-lg group"
              >
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>

                </div>
              </motion.div>
            ))}
          </div>


        </div>
      </section>

      {/* AI案例体验 */}
      <section id="ai-experience-1" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              AI案例体验
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              我们利用AI技术为医疗行业提供智能化解决方案，以下是我们的一些AI应用案例
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiCases.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg overflow-hidden shadow-lg group"
              >
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <Image 
                      src="/msbot.png" 
                      alt="AI医生logo" 
                      width={80} 
                      height={80} 
                      className="rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-center">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="mt-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      onClick={() => {
                        // 打开模态框并初始化AI对话
                        setIsAiModalOpen(true);
                        // 清空之前的对话历史
                        setAiMessages([]);
                        setAiConversationId(null);
                      }}
                    >
                      体验AI服务
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              联系我们
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg text-gray-300 max-w-3xl mx-auto"
            >
              如果您有任何问题或需求，请随时与我们联系，我们将竭诚为您服务
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">联系信息</h3>

              <div className="grid gap-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mr-4 shrink-0">
                    <Phone className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1">电话</p>
                    <p className="text-gray-300">+86 0755-8888-9999</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mr-4 shrink-0">
                    <Mail className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1">邮箱</p>
                    <p className="text-gray-300">contact@mstech-data.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mr-4 shrink-0">
                    <MapPin className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1">地址</p>
                    <p className="text-gray-300">深圳市南山区科技园区医疗大数据中心</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-8"
            >
              <h3 className="text-2xl font-bold mb-6">发送消息</h3>

              <form className="grid gap-6" onSubmit={handleFormSubmit}>
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    姓名
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="bg-gray-700 border-gray-600 rounded-lg p-3 text-white"
                    placeholder="请输入您的姓名"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    邮箱
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="bg-gray-700 border-gray-600 rounded-lg p-3 text-white"
                    placeholder="请输入您的邮箱"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    留言
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="bg-gray-700 border-gray-600 rounded-lg p-3 text-white"
                    placeholder="请输入您的留言"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button 
                  className="bg-blue-600 hover:bg-blue-700 w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '发送中...' : '发送消息'}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI对话模态框 */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isAiModalOpen ? 'block' : 'hidden'}`}>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-blue-100">
          <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <h3 className="text-xl font-bold text-white ml-4">AI男科医生</h3>
            </div>
            <button 
              className="text-white hover:text-gray-200 transition-colors"
              onClick={() => setIsAiModalOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-5 bg-blue-100 border-b border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">AI</div>
              <div>
                <p className="text-sm text-gray-800 mb-2 font-medium">您好，欢迎体验男科医疗AI咨询服务，请按下面格式简要描述您的情况：</p>
                <div className="bg-white p-3 rounded-lg shadow-sm text-xs text-gray-700">
                  <p className="font-medium mb-1">病情信息</p>
                  <p>年龄：</p>
                  <p>病情描述：如早泄，龟头敏感</p>
                  <p>过敏史： 如有</p>
                  <p>疾病史： 如有</p>
                  <p className="font-medium mt-2 mb-1">现病史（示例）</p>
                  <p>症状: 早泄，龟头敏感。挺久的了，记不清了。平时手淫三四次。早晨或夜间没有正常勃起。晨勃、性生活开始、性生活过程中阴茎勃起硬度为黄瓜。性生活中间停下来不动会疲软。与伴侣间感情关系一般</p>
                  <p className="font-medium mt-2 mb-1">用药情况: 否认历史用药</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 h-96" ref={aiMessagesEndRef}>
            {aiMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role !== 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3 mt-1">AI</div>
                )}
                <div className={`max-w-[80%] p-4 rounded-2xl ${message.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none shadow-md border border-blue-100'} `}>
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0">{line}</p>
                    ))}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold ml-3 mt-1">您</div>
                )}
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3 mt-1">AI</div>
                <div className="bg-white text-gray-800 p-4 rounded-2xl rounded-tl-none shadow-md border border-blue-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-5 bg-white border-t border-blue-100">
            <div className="flex space-x-3">
              <input
                type="text"
                className="flex-1 border border-blue-300 rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="请输入您的问题..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAiLoading) {
                    handleAiSubmit(aiCases[0].api, aiInput);
                    setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);
                    setAiInput("");
                  }
                }}
              />
              <button
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-full hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 shadow-md transition-all duration-200 flex items-center font-medium"
                disabled={isAiLoading}
                onClick={() => {
                  handleAiSubmit(aiCases[0].api, aiInput);
                  setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);
                  setAiInput("");
                }}
              >
                <Send size={18} className="mr-2" />
                发送
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                MS<span className="text-blue-500">TECH</span>
              </div>
              <p className="text-gray-400 mb-6">医疗数据智能化，科研分析新引擎。MSTECH专注医疗大数据与AI技术融合。</p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <span className="sr-only">微信</span>微
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <span className="sr-only">微博</span>博
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <span className="sr-only">领英</span>领
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">解决方案</h4>
              <ul className="grid gap-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    R Shiny全栈解决方案
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    AI医疗系统开发
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    统计分析与培训
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    合规保障服务
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">关于我们</h4>
              <ul className="grid gap-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    公司简介
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    团队介绍
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    发展历程
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    加入我们
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">联系我们</h4>
              <ul className="grid gap-2">
                <li className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-2" /> +86 0755-8888-9999
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" /> contact@mstech-data.com
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" /> 深圳市龙华区红山6979
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 MSTECH. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
