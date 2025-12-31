import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, ArrowRight, History, ChevronLeft, Trash2 } from 'lucide-react';
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
  availableSessions?: Array<{ sessionId: string; createdAt: string; messageCount: number }>;
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
      <div className="p-6 text-center border-b border-border/50">
        <img src="/fv.png" alt="Farm Vaidya" className="w-24 h-24 mx-auto mb-4 object-contain animate-bounce-in" />
        <h2 className="text-xl font-bold text-foreground mb-1">Welcome to Farm Vaidya</h2>
        <p className="text-sm text-muted-foreground">Your AI-powered agricultural assistant</p>
      </div>

      {step === 'form' && (
        <form onSubmit={handleContinue} className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col justify-center space-y-4">
          <p className="text-sm text-muted-foreground mb-2 text-center">Please introduce yourself to continue</p>

          <div className="space-y-4">
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
            className="w-full mt-4"
            disabled={!name || (!email && !phone) || isSubmitting || isSyncing}
          >
            {isSubmitting || isSyncing ? 'Loading...' : (
              <span className="inline-flex items-center justify-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            By continuing, you agree to receive support from our AI assistant.
          </p>
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
                  <div className="text-sm font-semibold">Conversation</div>
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
            className="w-full"
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
