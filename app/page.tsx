"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ArrowRight, Phone, Mail, MapPin, Menu, X, Send } from "lucide-react"
import { Button, Input, message } from "antd"
const { TextArea } = Input
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

  // 添加当前AI案例状态
  const [currentAiCase, setCurrentAiCase] = useState(0);

  // 添加处理AI案例点击的函数
  const handleAiCaseClick = (index: number) => {
    setCurrentAiCase(index);
    setIsAiModalOpen(true);
    // 清空之前的对话历史
    setAiMessages([]);
    setAiConversationId(null);
  };

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
      description: "基于Dify平台开发的AI男科医生，提供智能问诊服务。利用先进的自然语言处理技术，能够准确理解患者症状并给出专业建议。",
      api: "app-6P3BiitCyWEB1YWmFMez56pD",
    },
    {
      title: "ADaM医学智能助手",
      description: "ADaM是临床研究数据分析的标准模型，专门设计用于支持统计分析和高效率的数据审查。ADSL作为ADaM模型的核心数据集，为临床试验的统计分析提供基础框架。",
      api: "app-W2FKsslmjdpL5H5ZjvGbBPqQ",
    },
    {
      title: "WHI医学数据分析助手",
      description: "WHI医学数据分析助手是基于腾讯云智能技术开发的医学研究专业工具，专门用于Women's Health Initiative研究数据的深度分析和解读。为女性健康领域的研究和临床决策提供可靠的数据支持。",
      api: "app-v5DrQldm5ZnohmmszbRIdPvN",
    },
  ]

  return (
    <div className="relative">
      {/* 导航栏 */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrollY > 50 ? "bg-white shadow-md py-2" : "bg-white py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="text-3xl font-bold text-primary">
              MS<span className="text-blue-600">TECH</span>
            </div>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#home" className="font-medium hover:text-primary transition-colors text-lg">
              首页
            </Link>
            <Link href="#about" className="font-medium hover:text-primary transition-colors text-lg">
              关于我们
            </Link>
            <Link href="#solutions" className="font-medium hover:text-primary transition-colors text-lg">
              解决方案
            </Link>
            <Link href="#ai-experience" className="font-medium hover:text-primary transition-colors text-lg">
              成功案例
            </Link>
            <Link href="#ai-experience-1" className="font-medium hover:text-primary transition-colors text-lg">
              AI案例体验
            </Link>
            <Link href="#contact" className="font-medium hover:text-primary transition-colors text-lg">
              联系我们
            </Link>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
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
                className="md:hidden bg-white py-4"
              >
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                <Link
                  href="#home"
                  className="font-medium py-2 hover:text-primary transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  首页
                </Link>
                <Link
                  href="#about"
                  className="font-medium py-2 hover:text-primary transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  关于我们
                </Link>
                <Link
                  href="#solutions"
                  className="font-medium py-2 hover:text-primary transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  解决方案
                </Link>
                <Link
                  href="#ai-experience"
                  className="font-medium py-2 hover:text-primary transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  成功案例
                </Link>
                <Link
                  href="#ai-experience-1"
                  className="font-medium py-2 hover:text-primary transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  AI案例
                </Link>
                <Link
                  href="#contact"
                  className="font-medium py-2 hover:text-primary transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  联系我们
                </Link>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
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
            initial={{ opacity: 1, y: 0 }}
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
                type="default"
                ghost
                size="large"
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={{ 
                  borderColor: 'white', 
                  color: 'white',
                  fontSize: '18px',
                  height: '48px',
                  paddingLeft: '32px',
                  paddingRight: '32px'
                }}
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
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              关于我们
            </motion.h2>
            <motion.div
              initial={{ opacity: 1, width: "80px" }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 1 }}
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
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-lg overflow-hidden"
            >
              <Image src="/core-team.jpg?height=800&width=600" alt="MSTECH团队" fill className="object-cover" />
            </motion.div>

            <motion.div
              initial={{ opacity: 1, x: 0 }}
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
                  <p className="text-sm text-gray-600">哈佛大学生物统计 posterior | 深圳市海外高层次人才</p>
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
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              解决方案
            </motion.h2>
            <motion.div
              initial={{ opacity: 1, width: "80px" }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 1 }}
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
                initial={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              成功案例
            </motion.h2>
            <motion.div
              initial={{ opacity: 1, width: "80px" }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 1 }}
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
                initial={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              AI案例体验
            </motion.h2>
            <motion.div
              initial={{ opacity: 1, width: "80px" }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 1 }}
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
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="bg-white rounded-lg overflow-hidden shadow-lg group cursor-pointer transform transition-all duration-150 hover:shadow-2xl"
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex justify-center mb-4">
                    <Image 
                      src={index === 0 ? "/ai-urology-doctor.svg" : index === 1 ? "/adam-medical-assistant.svg" : "/whi-medical-assistant.svg"} 
                      alt={`${item.title}图标`} 
                      width={80} 
                      height={80} 
                      className=""
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-center group-hover:text-blue-600 transition-colors">{item.title}</h3>
                  <p className="text-gray-600 mb-6 flex-grow">{item.description}</p>
                  <div className="mt-auto">
                    <Button 
                      type="primary"
                      size="large"
                      block
                      onClick={() => handleAiCaseClick(index)}
                      style={{ 
                        background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                        borderColor: 'transparent',
                        height: '48px'
                      }}
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="end"
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
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              联系我们
            </motion.h2>
            <motion.div
              initial={{ opacity: 1, width: "80px" }}
              whileInView={{ opacity: 1, width: "80px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-blue-600 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 1 }}
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
              initial={{ opacity: 1, x: 0 }}
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
                    <p className="text-gray-300">+86 19124386399</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mr-4 shrink-0">
                    <Mail className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1">邮箱</p>
                    <p className="text-gray-300">mstech-ai@outlook.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mr-4 shrink-0">
                    <MapPin className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1">地址</p>
                    <p className="text-gray-300">深圳市龙华区红山6979</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 1, x: 0 }}
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
                  <Input
                    id="name"
                    size="large"
                    placeholder="请输入您的姓名"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4b5563',
                      color: 'white'
                    }}
                    className="placeholder-white"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    邮箱
                  </label>
                  <Input
                    type="email"
                    id="email"
                    size="large"
                    placeholder="请输入您的邮箱"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4b5563',
                      color: 'white'
                    }}
                    className="placeholder-white"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    留言
                  </label>
                  <TextArea
                    id="message"
                    rows={4}
                    placeholder="请输入您的留言"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4b5563',
                      color: 'white'
                    }}
                    className="placeholder-white"
                  />
                </div>

                <Button 
                  type="primary"
                  size="large"
                  block
                  loading={isSubmitting}
                  style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                >
                  {isSubmitting ? '发送中...' : '发送消息'}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI对话模态框 */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-blue-200"
            >
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className="w-3 h-3 bg-red-400 rounded-full shadow-sm"
                  ></motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"
                  ></motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className="w-3 h-3 bg-green-400 rounded-full shadow-sm"
                  ></motion.div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                     <Image src={currentAiCase === 0 ? "/ai-urology-doctor.svg" : currentAiCase === 1 ? "/adam-medical-assistant.svg" : "/whi-medical-assistant.svg"} alt="AI" width={24} height={24} className="" />
                   </div>
                  <h3 className="text-lg font-semibold text-white">
                    {aiCases[currentAiCase].title} - AI智能助手
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsAiModalOpen(false)}
                  className="text-white hover:text-red-200 transition-colors bg-white bg-opacity-20 rounded-full p-2"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 px-6 py-5 border-b border-blue-200">
                <div className="flex items-start space-x-4">
                  <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: 0.2, type: "spring" }}
                     className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
                   >
                     <Image src={currentAiCase === 0 ? "/ai-urology-doctor.svg" : currentAiCase === 1 ? "/adam-medical-assistant.svg" : "/whi-medical-assistant.svg"} alt="AI" width={40} height={40} className="" />
                   </motion.div>
                  <div className="flex-1">
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-gray-800 mb-3 font-medium"
                    >
                      您好，欢迎体验{aiCases[currentAiCase].title}，请按下面格式简要描述您的情况：
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {currentAiCase === 1 ? (
                        <div className="bg-gradient-to-r from-white to-blue-50 p-4 rounded-xl shadow-md border border-blue-200 text-sm text-gray-700">
                          <p className="font-medium mb-1 text-blue-800">请输入你的问题 例如:ADSL 数据集中的关键变量及其定义是什么？</p>
                        </div>
                      ) : currentAiCase === 2 ? (
                        <div className="bg-gradient-to-r from-white to-indigo-50 p-4 rounded-xl shadow-md border border-indigo-200 text-sm text-gray-700">
                          <p className="font-medium mb-1 text-indigo-800">请输入你的问题 例如:WHl 研究中血红蛋白 (HGB) 变量的测量单位和正常范围是多少？</p>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-white to-purple-50 p-4 rounded-xl shadow-md border border-purple-200 text-sm text-gray-700">
                          <p className="font-medium mb-2 text-purple-800">病情信息</p>
                          <div className="space-y-1 text-xs">
                            <p>年龄：</p>
                            <p>病情描述：如早泄，龟头敏感</p>
                            <p>过敏史： 如有</p>
                            <p>疾病史： 如有</p>
                          </div>
                          <p className="font-medium mt-3 mb-2 text-purple-800">现病史（示例）</p>
                          <p className="text-xs leading-relaxed">症状: 早泄，龟头敏感。挺久的了，记不清了。平时手淫三四次。早晨或夜间没有正常勃起。晨勃、性生活开始、性生活过程中阴茎勃起硬度为黄瓜。性生活中间停下来不动会疲软。与伴侣间感情关系一般</p>
                          <p className="font-medium mt-3 mb-1 text-purple-800">用药情况: 否认历史用药</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/30 via-indigo-50/30 to-purple-50/30" ref={aiMessagesEndRef}>
                {aiMessages.map((message, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role !== 'user' && (
                       <motion.div 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ delay: 0.2 }}
                         className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 mt-1 shadow-lg"
                       >
                         <Image src={currentAiCase === 0 ? "/ai-urology-doctor.svg" : currentAiCase === 1 ? "/adam-medical-assistant.svg" : "/whi-medical-assistant.svg"} alt="AI" width={32} height={32} className="" />
                       </motion.div>
                     )}
                    <motion.div 
                      className={`max-w-[75%] p-4 rounded-2xl backdrop-blur-sm ${message.role === 'user' ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-tr-none shadow-lg' : 'bg-white/90 text-gray-800 rounded-tl-none shadow-lg border border-blue-100/50'} `}
                    >
                      <div className="prose prose-sm max-w-none">
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0 leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </motion.div>
                    {message.role === 'user' && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold ml-3 mt-1 shadow-lg"
                      >
                        您
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                {isAiLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 mt-1 shadow-lg">
                       <Image src={currentAiCase === 0 ? "/ai-urology-doctor.svg" : currentAiCase === 1 ? "/adam-medical-assistant.svg" : "/whi-medical-assistant.svg"} alt="AI" width={32} height={32} className="" />
                     </div>
                    <div className="bg-white/90 text-gray-800 p-4 rounded-2xl rounded-tl-none shadow-lg border border-blue-100/50 backdrop-blur-sm">
                      <div className="flex space-x-2">
                        <motion.div 
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        ></motion.div>
                        <motion.div 
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        ></motion.div>
                        <motion.div 
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-t border-blue-200 p-6">
                <div className="flex space-x-4">
                  <Input
                    size="large"
                    placeholder="请输入您的问题..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onPressEnter={() => {
                      if (!isAiLoading) {
                        handleAiSubmit(aiCases[currentAiCase].api, aiInput);
                        setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);
                        setAiInput("");
                      }
                    }}
                    style={{
                      flex: 1,
                      borderRadius: '24px',
                      height: '48px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      borderColor: '#93c5fd',
                      borderWidth: '2px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    loading={isAiLoading}
                    onClick={() => {
                      handleAiSubmit(aiCases[currentAiCase].api, aiInput);
                      setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);
                      setAiInput("");
                    }}
                    style={{
                      background: 'linear-gradient(to right, #2563eb, #4f46e5, #7c3aed)',
                      borderColor: 'transparent',
                      borderRadius: '24px',
                      height: '48px',
                      paddingLeft: '32px',
                      paddingRight: '32px',
                      fontWeight: '500'
                    }}
                    icon={<Send size={18} />}
                  >
                    发送
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <Phone className="w-4 h-4 mr-2" /> +86 19124386399
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" /> mstech-ai@outlook.com
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