/*
 * EventRegisterModal — 회차 참가 신청 모달
 * - Step 1: 본인 식별 (이름 검색 → 카드 선택, 또는 신규 분기)
 * - Step 2: 정보 입력 (prefill 시각 단서 + PII 빈칸 + 회차별 질문 + 동의)
 * - Step 3: 완료 (입금 계좌 + 카톡 + 캘린더)
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowRight, ArrowLeft, Check, Loader2, Search,
  MessageCircle, Calendar, AlertCircle,
} from "lucide-react";

interface EventInfo {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity?: number;
  description?: string;
}

interface MemberCandidate {
  member_id: string;
  name: string;
  graduationYear: string;
  major: string;
  company: string;
  position: string;
  industry: string;
  orbit: string;
  introOneLiner: string;
  region: string;
  linkedinUrl: string;
}

interface FormData {
  member_id: string;
  name: string;
  graduationYear: string;
  major: string;
  company: string;
  position: string;
  industry: string;
  orbit: string;
  introOneLiner: string;
  region: string;
  linkedinUrl: string;
  phone: string;
  email: string;
  instagramId: string;
  referrerName: string;
  hasCompanion: boolean;
  companionInfo: string;
  expectations: string;
  comment: string;
  isMasterUpdate: boolean;
  consent: boolean;
}

const EMPTY_FORM: FormData = {
  member_id: "", name: "", graduationYear: "", major: "",
  company: "", position: "", industry: "", orbit: "",
  introOneLiner: "", region: "", linkedinUrl: "",
  phone: "", email: "",
  instagramId: "", referrerName: "",
  hasCompanion: false, companionInfo: "",
  expectations: "", comment: "",
  isMasterUpdate: true, consent: false,
};

const ORBITS = ["Ground Crew", "Launcher", "Rocket", "Orbiter", "Galaxy", "Cosmos"];
const INDUSTRIES = [
  "기술 · IT · 데이터", "기획 · 전략 · 컨설팅", "마케팅 · 브랜딩 · 콘텐츠",
  "영업 · 사업개발 · 고객", "금융 · 투자 · 회계", "디자인 · 크리에이티브 · 예술",
  "연구 · 공공 · 교육 · 전문직", "창업 · 대표 · 프리랜서",
  "건설/건축 · 엔지니어링 · 인프라", "HR · 조직 · 인사",
  "전문직(법무, 의료 등)", "기타",
];

const PAYMENT_INFO = {
  bank: "농협",
  account: "352-1262-019923",
  holder: "박준홍",
  amount: "55,000원",
};

const KAKAO_OPEN = "https://open.kakao.com/o/g9PW9lui";

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  return Math.max(0, Math.floor(diff / 86400000));
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: EventInfo;
}

export default function EventRegisterModal({ isOpen, onClose, event }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ registrationId: string; memberId: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(1); setQuery(""); setCandidates([]); setSearchAttempted(false);
      setIsNew(false); setForm(EMPTY_FORM); setSubmitting(false);
      setResult(null); setError("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) { setError("이름을 2글자 이상 입력해주세요"); return; }
    setError(""); setSearching(true); setSearchAttempted(true);
    try {
      const r = await fetch("/api/member-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: q }),
      });
      const data = await r.json();
      setCandidates(Array.isArray(data.candidates) ? data.candidates : []);
    } catch {
      setCandidates([]);
      setError("검색 실패. 잠시 후 다시 시도해주세요");
    } finally {
      setSearching(false);
    }
  };

  const selectCandidate = (c: MemberCandidate) => {
    setForm({
      ...EMPTY_FORM,
      member_id: c.member_id, name: c.name,
      graduationYear: c.graduationYear, major: c.major,
      company: c.company, position: c.position,
      industry: c.industry, orbit: c.orbit,
      introOneLiner: c.introOneLiner, region: c.region,
      linkedinUrl: c.linkedinUrl,
      isMasterUpdate: true, consent: false,
    });
    setIsNew(false); setError(""); setStep(2);
  };

  const startNew = () => {
    setForm({ ...EMPTY_FORM, name: query.trim(), isMasterUpdate: true });
    setIsNew(true); setError(""); setStep(2);
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (error) setError("");
  };

  const validate = (): string => {
    if (!form.name.trim()) return "이름을 입력해주세요";
    if (!form.graduationYear.trim()) return "학번을 입력해주세요";
    if (!form.major.trim()) return "전공을 입력해주세요";
    if (!form.company.trim()) return "현재 소속을 입력해주세요";
    if (!form.industry) return "직군을 선택해주세요";
    if (!form.phone.trim() || !/^[0-9-]+$/.test(form.phone) || form.phone.replace(/-/g, "").length < 10)
      return "올바른 전화번호를 입력해주세요";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "올바른 이메일을 입력해주세요";
    if (!form.consent) return "개인정보 수집·이용 동의가 필요합니다";
    return "";
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setSubmitting(true);
    try {
      const payload = {
        eventId: event.id,
        memberId: isNew ? "" : form.member_id,
        isNewMember: isNew,
        isMasterUpdate: !isNew && form.isMasterUpdate,
        name: form.name.trim(),
        graduationYear: form.graduationYear.trim(),
        major: form.major.trim(),
        company: form.company.trim(),
        position: form.position.trim(),
        industry: form.industry,
        orbit: form.orbit,
        introOneLiner: form.introOneLiner.trim(),
        region: form.region.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        phone: form.phone.replace(/-/g, ""),
        email: form.email.trim(),
        instagramId: form.instagramId.trim(),
        referrerName: form.referrerName.trim(),
        hasCompanion: form.hasCompanion,
        companionInfo: form.companionInfo.trim(),
        expectations: form.expectations.trim(),
        comment: form.comment.trim(),
      };
      const r = await fetch("/api/event-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data.success) {
        setResult({ registrationId: data.registrationId, memberId: data.memberId });
        setStep(3);
      } else {
        setError(data.error || "신청 실패. 잠시 후 다시 시도해주세요");
      }
    } catch {
      setError("네트워크 오류. 잠시 후 다시 시도해주세요");
    } finally {
      setSubmitting(false);
    }
  };

  const copyAccount = () => {
    navigator.clipboard?.writeText(PAYMENT_INFO.account).catch(() => {});
  };

  const daysLeft = getDaysUntil(event.date);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-charcoal-deep/85 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-2xl max-h-[92vh] mx-4 overflow-hidden bg-charcoal border border-gold/20 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-gold/10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gold/70 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
                  Event Registration
                </span>
                {step !== 3 && (
                  <span className="text-ivory/30 text-[10px]">·</span>
                )}
                {step !== 3 && (
                  <span className="text-ivory/40 text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
                    Step {step} / 2
                  </span>
                )}
              </div>
              <h3 className="text-ivory text-xl truncate" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                {event.title}
              </h3>
              <p className="text-ivory/50 text-xs mt-1" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                {event.date} {event.time} · {event.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 -mr-2 -mt-1 text-ivory/40 hover:text-gold transition-colors"
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            {/* ============== STEP 1: 이름 검색 ============== */}
            {step === 1 && (
              <div>
                <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: "var(--font-body)" }}>
                  이름 *
                </label>
                <p className="text-ivory/40 text-xs mb-3" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  이미 PNU Alliance 멤버시면 이름 검색으로 정보가 자동 채워집니다. 처음이면 0건이 뜨고 신규 등록으로 넘어가세요.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); if (error) setError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") search(); }}
                    placeholder="예) 박준홍"
                    autoFocus
                    className="flex-1 px-4 py-3 bg-charcoal-deep border border-gold/15 text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-gold/40 text-base"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                  <button
                    onClick={search}
                    disabled={searching}
                    className="px-5 py-3 bg-gold text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center gap-2"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                  >
                    {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    검색
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 mt-3 text-burgundy text-sm">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                {searchAttempted && !searching && candidates.length > 0 && (
                  <div className="mt-6">
                    <p className="text-ivory/50 text-xs tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "var(--font-body)" }}>
                      매치 {candidates.length}명 — 본인을 선택해주세요
                    </p>
                    <div className="space-y-2">
                      {candidates.map((c) => (
                        <button
                          key={c.member_id}
                          onClick={() => selectCandidate(c)}
                          className="w-full text-left px-4 py-3 border border-gold/15 hover:border-gold/40 hover:bg-gold/5 transition-all duration-200 group"
                        >
                          <div className="flex items-baseline gap-3 mb-1">
                            <span className="text-ivory text-base group-hover:text-gold transition-colors" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                              {c.name}
                            </span>
                            {c.graduationYear && (
                              <span className="text-gold/60 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                                {c.graduationYear}학번
                              </span>
                            )}
                          </div>
                          <div className="text-ivory/50 text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                            {[c.company, c.position, c.industry].filter(Boolean).join(" · ")}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchAttempted && !searching && candidates.length === 0 && (
                  <div className="mt-6 p-5 border border-gold/10 bg-charcoal-deep/50">
                    <p className="text-ivory/60 text-sm mb-3" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      "{query}" 검색 결과가 없습니다.
                    </p>
                    <p className="text-ivory/40 text-xs mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      처음 오시거나, 등록된 정보가 다를 수 있습니다. 신규로 등록하면 다음 회차부터는 자동으로 채워집니다.
                    </p>
                    <button
                      onClick={startNew}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                    >
                      신규 멤버로 등록하기
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ============== STEP 2: 정보 입력 ============== */}
            {step === 2 && (
              <div className="space-y-5">
                {!isNew && (
                  <div className="flex items-start gap-2 p-3 bg-gold/5 border border-gold/15">
                    <Check size={14} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-ivory/70 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        <span className="text-gold">{form.name}</span>님으로 식별되었습니다. 옅은 골드 배경 = 이전에 등록된 정보 (수정 가능).
                      </p>
                    </div>
                  </div>
                )}

                {/* 본인 정보 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="이름" required value={form.name} onChange={(v) => updateField("name", v)} prefilled={!isNew && !!form.name} />
                  <Field label="학번 (예: 18)" required value={form.graduationYear} onChange={(v) => updateField("graduationYear", v.replace(/\D/g, "").slice(0, 2))} prefilled={!isNew && !!form.graduationYear} />
                  <Field label="전공" required value={form.major} onChange={(v) => updateField("major", v)} prefilled={!isNew && !!form.major} />
                  <Field label="회사 / 소속" required value={form.company} onChange={(v) => updateField("company", v)} prefilled={!isNew && !!form.company} />
                  <Field label="직급 / 직함" value={form.position} onChange={(v) => updateField("position", v)} prefilled={!isNew && !!form.position} />
                  <SelectField label="직군" required value={form.industry} options={INDUSTRIES} onChange={(v) => updateField("industry", v)} prefilled={!isNew && !!form.industry} />
                  <SelectField label="현재 궤도" value={form.orbit} options={ORBITS} onChange={(v) => updateField("orbit", v)} prefilled={!isNew && !!form.orbit} placeholder="선택해주세요" />
                  <Field label="거주 지역" value={form.region} onChange={(v) => updateField("region", v)} prefilled={!isNew && !!form.region} placeholder="예) 서울 마포구" />
                </div>
                <Field label="자기소개 한 줄" value={form.introOneLiner} onChange={(v) => updateField("introOneLiner", v)} prefilled={!isNew && !!form.introOneLiner} placeholder="예) 사이드 프로젝트로 SaaS 만들고 있습니다" />

                {!isNew && (
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.isMasterUpdate}
                      onChange={(e) => updateField("isMasterUpdate", e.target.checked)}
                      className="mt-0.5 accent-gold"
                    />
                    <span className="text-ivory/50 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      위 정보가 이전과 다르면 멤버 마스터에 반영합니다 (체크 해제 시 이번 회차에만 적용)
                    </span>
                  </label>
                )}

                <div className="border-t border-gold/10 pt-5">
                  <p className="text-gold/70 text-xs tracking-[0.2em] uppercase mb-3" style={{ fontFamily: "var(--font-body)" }}>
                    연락처 (이번에 입력)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="전화번호"
                      required
                      value={form.phone}
                      onChange={(v) => updateField("phone", formatPhone(v))}
                      placeholder="010-0000-0000"
                      type="tel"
                    />
                    <Field
                      label="이메일"
                      required
                      value={form.email}
                      onChange={(v) => updateField("email", v)}
                      placeholder="your@email.com"
                      type="email"
                    />
                  </div>
                </div>

                <div className="border-t border-gold/10 pt-5">
                  <p className="text-gold/70 text-xs tracking-[0.2em] uppercase mb-3" style={{ fontFamily: "var(--font-body)" }}>
                    이번 회차 — The Bridge
                  </p>
                  <div className="space-y-4">
                    <Field label="인스타그램 ID" value={form.instagramId} onChange={(v) => updateField("instagramId", v)} placeholder="@your_id" />
                    <Field label="초대해주신 분 (있으면)" value={form.referrerName} onChange={(v) => updateField("referrerName", v)} placeholder="예) 박준홍" />
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.hasCompanion} onChange={(e) => updateField("hasCompanion", e.target.checked)} className="mt-0.5 accent-gold" />
                      <span className="text-ivory/60 text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        부산대 동문 1명 동반 참석합니다
                      </span>
                    </label>
                    {form.hasCompanion && (
                      <Field label="동반자 이름·연락처" value={form.companionInfo} onChange={(v) => updateField("companionInfo", v)} placeholder="예) 김동문 / 010-1234-5678" />
                    )}
                    <TextareaField label="이번 자리에 기대하는 점" value={form.expectations} onChange={(v) => updateField("expectations", v)} placeholder="(선택)" />
                    <TextareaField label="의견·질문" value={form.comment} onChange={(v) => updateField("comment", v)} placeholder="(선택)" />
                  </div>
                </div>

                <div className="border-t border-gold/10 pt-5">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.consent} onChange={(e) => updateField("consent", e.target.checked)} className="mt-1 accent-gold" />
                    <span className="text-ivory/55 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      <span className="text-ivory/80">개인정보 수집·이용 동의 (필수).</span>
                      {" "}수집항목: 이름·전화·이메일·소속·학번. 이용목적: 4회차 운영·연락. 보관기간: 2년 후 폐기.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-burgundy text-sm">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
              </div>
            )}

            {/* ============== STEP 3: 완료 ============== */}
            {step === 3 && result && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/40 mb-5"
                >
                  <Check size={28} className="text-gold" />
                </motion.div>
                <h4 className="text-ivory text-2xl mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                  신청 완료
                </h4>
                <p className="text-ivory/50 text-sm mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  접수 번호 <span className="text-gold/80">{result.registrationId}</span>
                </p>
                {daysLeft > 0 && (
                  <p className="text-gold/70 text-sm mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    {event.title} 까지 <span className="text-gold text-base" style={{ fontWeight: 500 }}>D-{daysLeft}</span>
                  </p>
                )}

                <div className="text-left space-y-4">
                  {/* 입금 안내 */}
                  <div className="p-4 border border-gold/20 bg-gold/5">
                    <p className="text-gold/70 text-[10px] tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "var(--font-body)" }}>
                      참가비 입금 안내
                    </p>
                    <p className="text-ivory text-base mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                      {PAYMENT_INFO.amount}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-ivory/70 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                        {PAYMENT_INFO.bank} <span className="text-ivory">{PAYMENT_INFO.account}</span> ({PAYMENT_INFO.holder})
                      </p>
                      <button
                        onClick={copyAccount}
                        className="text-xs text-gold/70 hover:text-gold border border-gold/30 px-2 py-1 hover:bg-gold/10 transition-colors"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        계좌번호 복사
                      </button>
                    </div>
                    <p className="text-ivory/35 text-[11px] mt-3 leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      입금자명은 <span className="text-ivory/60">신청자 본인 이름</span>으로 부탁드립니다.
                      행사 5일 전 결제가 이뤄질 예정이라, 그전까지 일정 변경 시 환불 가능합니다.
                    </p>
                  </div>

                  {/* CTA */}
                  <a
                    href={KAKAO_OPEN}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 border border-gold/20 hover:border-gold/40 hover:bg-gold/5 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <MessageCircle size={14} className="text-gold/70" />
                        <span className="text-ivory text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>
                          카카오톡 오픈채팅 입장
                        </span>
                      </div>
                      <p className="text-ivory/40 text-xs ml-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        운영진·다른 멤버와 미리 인사 나누세요
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-ivory/30 group-hover:text-gold/60 group-hover:translate-x-0.5 transition-all" />
                  </a>

                  <a
                    href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date.replace(/-/g, "")}T${(event.time || "19:30").replace(":", "")}00/${event.date.replace(/-/g, "")}T223000&location=${encodeURIComponent(event.location)}&details=${encodeURIComponent("PNU Alliance 4th Meetup — The Bridge")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 border border-gold/15 hover:border-gold/35 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gold/70" />
                      <span className="text-ivory/70 text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        구글 캘린더에 추가
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-ivory/30 group-hover:text-gold/60 transition-colors" />
                  </a>

                  {/* Bridge note */}
                  <div className="p-3 border-l-2 border-gold/30 bg-charcoal-deep/40">
                    <p className="text-ivory/55 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      🌉 <span className="text-gold/80">The Bridge</span>는 추천으로 잇는 회차입니다.
                      함께 모셔오신 동문 한 분이 있으시면 신청 후 카톡으로 연락 주세요.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== 3 && (
            <div className="flex items-center justify-between gap-3 px-7 py-4 border-t border-gold/10 bg-charcoal-deep/50">
              {step === 1 ? (
                <button onClick={onClose} className="text-ivory/40 hover:text-ivory/70 text-sm transition-colors" style={{ fontFamily: "var(--font-body)" }}>
                  취소
                </button>
              ) : (
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex items-center gap-1.5 text-ivory/50 hover:text-ivory text-sm transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <ArrowLeft size={14} /> 이전
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gold text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  신청 제출
                </button>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-gold/10 bg-charcoal-deep/50">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gold/30 text-gold text-sm tracking-[0.1em] uppercase hover:bg-gold/10 transition-colors"
                style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
              >
                닫기
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============== Sub-components ==============

function Field({
  label, value, onChange, required, placeholder, type = "text", prefilled = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; placeholder?: string; type?: string; prefilled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
        {label} {required && <span className="text-gold/60">*</span>}
        {prefilled && <span className="text-gold/50 text-[9px] normal-case tracking-normal">이전 정보</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`px-3 py-2.5 border text-ivory text-sm focus:outline-none transition-colors ${
          prefilled
            ? "bg-gold/5 border-gold/25 focus:border-gold/50"
            : "bg-charcoal-deep border-gold/15 focus:border-gold/40"
        }`}
        style={{ fontFamily: "var(--font-body)" }}
      />
    </div>
  );
}

function SelectField({
  label, value, options, onChange, required, prefilled = false, placeholder,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
  required?: boolean; prefilled?: boolean; placeholder?: string;
}) {
  const valueInOptions = options.includes(value);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
        {label} {required && <span className="text-gold/60">*</span>}
        {prefilled && value && <span className="text-gold/50 text-[9px] normal-case tracking-normal">이전 정보</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`px-3 py-2.5 border text-ivory text-sm focus:outline-none transition-colors ${
          prefilled && value
            ? "bg-gold/5 border-gold/25 focus:border-gold/50"
            : "bg-charcoal-deep border-gold/15 focus:border-gold/40"
        }`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <option value="">{placeholder || "선택해주세요"}</option>
        {!valueInOptions && value && <option value={value}>{value} (기존 데이터)</option>}
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function TextareaField({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-ivory/50 text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="px-3 py-2.5 bg-charcoal-deep border border-gold/15 text-ivory text-sm focus:outline-none focus:border-gold/40 resize-none"
        style={{ fontFamily: "var(--font-body)" }}
      />
    </div>
  );
}
