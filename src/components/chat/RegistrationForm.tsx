import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, ArrowRight, History, ChevronLeft, Trash2, Linkedin } from 'lucide-react';
import { z } from 'zod';

const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long'),
    email: z.string().trim().email('Please enter a valid email address').optional().or(z.literal('')),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-()\s]{7,}$/, { message: 'Please enter a valid phone number' })
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => (data.email && data.email.trim()) || (data.phone && data.phone.trim()), {
    message: 'Provide either email or mobile number',
    path: ['contact'],
  });

type AuthStep = 'form' | 'history';

interface RegistrationFormProps {
  step: AuthStep;
  onSubmitDetails: (name: string, contact: string) => void;
  onStartNew: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onBack?: () => void;
  availableSessions?: Array<{ sessionId: string; name?: string; createdAt: string; messageCount: number }>;
  isSyncing?: boolean;
  pendingUser?: { name: string; contact: string } | null;
}

const RegistrationForm = ({
  step,
  onSubmitDetails,
  onStartNew,
  onSelectSession,
  onDeleteSession,
  onBack,
  availableSessions = [],
  isSyncing = false,
  pendingUser,
}: RegistrationFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; contact?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildValidatedPayload = () => {
    const validated = registrationSchema.parse({ name, email, phone });
    const contact = validated.email?.trim() ? validated.email : validated.phone?.trim() || '';
    return { name: validated.name, contact };
  };

  const handleContinue = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = buildValidatedPayload();
      onSubmitDetails(payload.name, payload.contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { name?: string; email?: string; phone?: string; contact?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'name') fieldErrors.name = err.message;
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'phone') fieldErrors.phone = err.message;
          if (err.path[0] === 'contact') fieldErrors.contact = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 py-0 text-center border-b border-border/50">
        <img src="/fv.png" alt="Farm Vaidya" className="w-[140px] h-[140px] mx-auto -mt-10 mb-0 object-contain animate-bounce-in" />
        <h2 className="text-xl font-bold leading-tight text-foreground -mt-5">Welcome to Farm Vaidya</h2>
      </div>

      {step === 'form' && (
        <form onSubmit={handleContinue} className="flex-1 min-h-0 overflow-y-auto p-4 pt-3 flex flex-col space-y-4">
          <div className="rounded-lg p-5 space-y-4 border" style={{backgroundColor: '#e8f5f0', borderColor: '#d0ebe5'}}>
            <p className="text-sm text-muted-foreground text-center">Please introduce yourself to continue</p>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive animate-fade-in">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Your email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Mobile number (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#008F4C] hover:bg-[#007A3D] text-white px-6 py-2 rounded-3xl transition-colors"
              disabled={!name || (!email && !phone) || isSubmitting || isSyncing}
            >
              {isSubmitting || isSyncing ? 'Loading...' : (
                <span className="inline-flex items-center justify-center gap-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to receive support from our AI agent.
          </p>

          {/* Contact Details Footer */}
          <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold text-foreground">Connect With Us</p>
              
              <a
                href="mailto:ceo@farmvaidya.ai"
                className="flex items-center justify-center gap-2 text-xs text-[#008F4C] hover:text-[#007A3D] transition-colors"
              >
                <Mail className="w-4 h-4" />
                ceo@farmvaidya.ai
              </a>

              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href="https://linkedin.com/company/farmvaidya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors text-[#008F4C] hover:text-[#007A3D]"
                  style={{backgroundColor: '#d0ebe5'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b8e0d9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d0ebe5'}
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com/farmvaidya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors text-[#008F4C] hover:text-[#007A3D]"
                  style={{backgroundColor: '#d0ebe5'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b8e0d9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d0ebe5'}
                  title="Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a4.5 4.5 0 01-1.3-4.5z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/farmvaidyaaitech3?igsh=NHJwZWRxb204amc2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors text-[#008F4C] hover:text-[#007A3D]"
                  style={{backgroundColor: '#d0ebe5'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b8e0d9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d0ebe5'}
                  title="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </form>
      )}

      {step === 'history' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-semibold text-foreground">{pendingUser?.name}</p>
              <p className="text-xs text-muted-foreground">{pendingUser?.contact}</p>
            </div>
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} aria-label="Back">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <History className="w-4 h-4" />
            Conversation history
          </div>

          <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1">
            {availableSessions.length === 0 && (
              <div className="text-sm text-muted-foreground">No previous conversations found.</div>
            )}
            {availableSessions.map((session) => (
              <div
                key={session.sessionId}
                className="w-full px-3 py-3 rounded-xl border border-border/60 bg-white hover:bg-yellow-50 transition flex items-center justify-between gap-3 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(session.sessionId)}
                  className="flex-1 text-left"
                >
                  <div className="text-sm font-semibold">{session.name || 'New Conversation'}</div>
                  <div className="text-xs text-muted-foreground">{new Date(session.createdAt).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{session.messageCount} msgs</div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="iconSm"
                  aria-label="Delete conversation"
                  onClick={() => onDeleteSession(session.sessionId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            className="w-full bg-[#008F4C] hover:bg-[#007A3D] text-white px-6 py-2 rounded-3xl transition-colors"
            onClick={onStartNew}
            disabled={isSyncing}
          >
            Start New Conversation
          </Button>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
