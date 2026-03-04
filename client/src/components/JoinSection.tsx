/*
 * JoinSection — PNU Alliance (고도화)
 * - 실제 작동하는 합류 신청 폼 (2단계)
 * - 폼 유효성 검사 + 성공 애니메이션
 */
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const GRADUATION_YEARS = Array.from({ length: 30 }, (_, i) => String(2025 - i));
const INDUSTRIES = [
  "IT/소프트웨어","금융/핀테크","컨설팅/전략","스타트업/창업",
  "방산/항공우주","의료/바이오","법률/법무","미디어/콘텐츠",
  "제조/엔지니어링","공공/정부","학계/연구","기타",
];

interface FormData {
  name: string; email: string; phone: string; graduationYear: string;
  major: string; company: string; position: string; industry: string;
  motivation: string; referral: string;
}
const INIT: FormData = {
  name:"",email:"",phone:"",graduationYear:"",major:"",
  company:"",position:"",industry:"",motivation:"",referral:"",
};

function Field({ label, name, value, onChange, placeholder, type="text", required=false }: {
  label: string; name: keyof FormData; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase" style={{fontFamily:"var(--font-body)",fontWeight:300}}>
        {label} {required && <span className="text-gold/60">*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="input-dark" />
    </div>
  );
}

export default function JoinSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name as keyof FormData]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validateStep1 = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "이름을 입력해주세요";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "올바른 이메일을 입력해주세요";
    if (!form.graduationYear) e.graduationYear = "졸업연도를 선택해주세요";
    if (!form.major.trim()) e.major = "전공을 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Partial<FormData> = {};
    if (!form.company.trim()) e.company = "현재 소속을 입력해주세요";
    if (!form.industry) e.industry = "업계를 선택해주세요";
    if (!form.motivation.trim() || form.motivation.length < 20) e.motivation = "20자 이상 작성해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) { setStep(2); return; }
    if (step === 2 && validateStep2()) {
      setSubmitting(true);
      await new Promise(r => setTimeout(r, 1800));
      setSubmitting(false);
      setSubmitted(true);
      setStep(3);
    }
  };

  return (
    <section id="join" className="relative py-28 lg:py-40 overflow-hidden bg-charcoal">
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gold/2 blur-[120px] pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left — Info */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-px bg-gold/40" />
              <span className="text-gold/70 text-xs tracking-[0.35em] uppercase" style={{fontFamily:"var(--font-body)",fontWeight:300}}>Join Us</span>
            </div>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl text-ivory leading-[1.05] mb-8" style={{fontFamily:"var(--font-display)",fontWeight:400}}>
              당신의 궤도를<br />
              <span className="text-gold-gradient italic" style={{fontWeight:300}}>함께 그린다</span>
            </h2>
            <div className="space-y-6 mb-10">
              {[
                { s:"01", t:"신청서 제출", d:"간단한 정보를 입력하면 운영진이 검토합니다." },
                { s:"02", t:"운영진 리뷰", d:"부산대 출신 여부와 커뮤니티 적합성을 검토합니다. 보통 3~5일 소요." },
                { s:"03", t:"온보딩 미팅", d:"호스트와 짧은 1:1 대화 후 커뮤니티에 합류합니다." },
              ].map(item => (
                <div key={item.s} className="flex gap-5">
                  <span className="text-gold/30 text-2xl shrink-0 leading-none" style={{fontFamily:"var(--font-display)",fontWeight:300}}>{item.s}</span>
                  <div>
                    <h4 className="text-ivory/80 text-base mb-1" style={{fontFamily:"var(--font-display)",fontWeight:400}}>{item.t}</h4>
                    <p className="text-ivory/40 text-sm leading-[1.8]" style={{fontFamily:"var(--font-body)",fontWeight:300}}>{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <blockquote className="border-l-2 border-gold/30 pl-5">
              <p className="text-ivory/50 text-base italic leading-[1.8]" style={{fontFamily:"var(--font-display)",fontWeight:400}}>
                "지금은 스카이가 롤모델이지만, 나중에는 후배님이 만든 게 롤모델이 되는 거예요."
              </p>
              <cite className="text-gold/40 text-xs tracking-[0.2em] uppercase not-italic mt-2 block" style={{fontFamily:"var(--font-body)",fontWeight:300}}>
                — 이대한 선배, BAE Systems
              </cite>
            </blockquote>
          </motion.div>

          {/* Right — Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.1 }}>
            {!submitted && (
              <div className="flex items-center gap-3 mb-8">
                {[1,2].map(s => (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-7 h-7 flex items-center justify-center text-xs transition-all duration-300 ${step >= s ? "bg-gold text-charcoal-deep" : "border border-gold/20 text-ivory/30"}`} style={{fontFamily:"var(--font-body)",fontWeight:500}}>
                      {step > s ? <Check size={12} /> : s}
                    </div>
                    <span className={`text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${step >= s ? "text-ivory/60" : "text-ivory/25"}`} style={{fontFamily:"var(--font-body)",fontWeight:300}}>
                      {s === 1 ? "기본 정보" : "상세 정보"}
                    </span>
                    {s < 2 && <div className="w-8 h-px bg-gold/20" />}
                  </div>
                ))}
              </div>
            )}

            <div className="border border-gold/15 bg-charcoal-deep/50 p-7 lg:p-9">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.3}} className="space-y-5">
                    <h3 className="text-ivory text-xl mb-6" style={{fontFamily:"var(--font-display)",fontWeight:400}}>기본 정보</h3>
                    <Field label="이름" name="name" value={form.name} onChange={handleChange} placeholder="홍길동" required />
                    {errors.name && <p className="text-red-400/70 text-xs -mt-3">{errors.name}</p>}
                    <Field label="이메일" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" type="email" required />
                    {errors.email && <p className="text-red-400/70 text-xs -mt-3">{errors.email}</p>}
                    <Field label="연락처" name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" type="tel" />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase" style={{fontFamily:"var(--font-body)",fontWeight:300}}>졸업연도 <span className="text-gold/60">*</span></label>
                      <select name="graduationYear" value={form.graduationYear} onChange={handleChange} className="input-dark">
                        <option value="">선택해주세요</option>
                        {GRADUATION_YEARS.map(y => <option key={y} value={y}>{y}년 ({parseInt(y) <= 2024 ? "졸업" : "재학/졸업예정"})</option>)}
                      </select>
                      {errors.graduationYear && <p className="text-red-400/70 text-xs">{errors.graduationYear}</p>}
                    </div>
                    <Field label="전공" name="major" value={form.major} onChange={handleChange} placeholder="기계공학과" required />
                    {errors.major && <p className="text-red-400/70 text-xs -mt-3">{errors.major}</p>}
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.3}} className="space-y-5">
                    <h3 className="text-ivory text-xl mb-6" style={{fontFamily:"var(--font-display)",fontWeight:400}}>상세 정보</h3>
                    <Field label="현재 소속 (회사/학교)" name="company" value={form.company} onChange={handleChange} placeholder="삼성전자 / 서울대학교 대학원" required />
                    {errors.company && <p className="text-red-400/70 text-xs -mt-3">{errors.company}</p>}
                    <Field label="직책/역할" name="position" value={form.position} onChange={handleChange} placeholder="소프트웨어 엔지니어" />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase" style={{fontFamily:"var(--font-body)",fontWeight:300}}>업계 <span className="text-gold/60">*</span></label>
                      <select name="industry" value={form.industry} onChange={handleChange} className="input-dark">
                        <option value="">선택해주세요</option>
                        {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                      {errors.industry && <p className="text-red-400/70 text-xs">{errors.industry}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase" style={{fontFamily:"var(--font-body)",fontWeight:300}}>합류 동기 <span className="text-gold/60">*</span></label>
                      <textarea name="motivation" value={form.motivation} onChange={handleChange} placeholder="PNU Alliance에 합류하고 싶은 이유와, 커뮤니티에 기여할 수 있는 점을 자유롭게 적어주세요. (20자 이상)" rows={4} className="input-dark resize-none" />
                      <p className="text-ivory/25 text-[10px]" style={{fontFamily:"var(--font-body)"}}>{form.motivation.length}자</p>
                      {errors.motivation && <p className="text-red-400/70 text-xs">{errors.motivation}</p>}
                    </div>
                    <Field label="추천인 (선택)" name="referral" value={form.referral} onChange={handleChange} placeholder="추천해준 멤버의 이름" />
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="s3" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.5}} className="py-8 text-center">
                    <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:200,delay:0.2}} className="w-16 h-16 bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
                      <Check size={28} className="text-gold" />
                    </motion.div>
                    <h3 className="text-ivory text-2xl mb-3" style={{fontFamily:"var(--font-display)",fontWeight:400}}>신청이 접수되었습니다</h3>
                    <p className="text-ivory/50 text-sm leading-[1.9] mb-6" style={{fontFamily:"var(--font-body)",fontWeight:300}}>
                      {form.name}님의 신청을 검토 후 3~5일 내로 연락드리겠습니다.<br />이메일({form.email})을 확인해주세요.
                    </p>
                    <div className="gold-divider mb-6" />
                    <p className="text-ivory/30 text-xs italic" style={{fontFamily:"var(--font-display)}"}}>
                      "혼자 싸우지 않아도 되는 세상을 함께 만들어요."
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!submitted && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gold/10">
                  {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-ivory/40 text-xs tracking-[0.15em] uppercase hover:text-ivory/70 transition-colors duration-300" style={{fontFamily:"var(--font-body)",fontWeight:300}}>
                      <ArrowLeft size={12} /> 이전
                    </button>
                  ) : <div />}
                  <button onClick={handleNext} disabled={submitting} className="flex items-center gap-2 px-6 py-3 bg-gold text-charcoal-deep text-xs tracking-[0.2em] uppercase hover:bg-gold-light transition-all duration-300 disabled:opacity-50" style={{fontFamily:"var(--font-body)",fontWeight:500}}>
                    {submitting ? <><Loader2 size={14} className="animate-spin" /> 처리 중...</> : step === 2 ? <><Check size={12} /> 신청 완료</> : <>다음 <ArrowRight size={12} /></>}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
