import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import html2canvas from 'html2canvas';
import { Award, Check, Download, ExternalLink, Facebook, Link2, Linkedin, Mail, MessageCircle, Share2, Twitter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Quiz {
    id: number;
    title: string;
    brand_settings: {
        primary_color?: string;
        secondary_color?: string;
    } | null;
    cta_settings: {
        label?: string;
        url?: string;
    } | null;
}

interface Submission {
    id: number;
    total_score: number;
    dimension_scores: Record<string, number> | null;
}

interface Outcome {
    name: string;
    description: string;
    content_blocks: Array<{
        type: string;
        content: string;
    }> | null;
    cta_override: {
        label?: string;
        url?: string;
    } | null;
}

interface ResultsPageProps {
    quiz: Quiz;
    submission: Submission;
    outcome: Outcome | null;
}

export default function PublicResults({ quiz, submission, outcome }: ResultsPageProps) {
    const [copied, setCopied] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);
    const resultsCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    }, []);

    const primaryColor = quiz.brand_settings?.primary_color || '#E97451';
    const ctaLabel = outcome?.cta_override?.label || quiz.cta_settings?.label || 'Learn More';
    const ctaUrl = outcome?.cta_override?.url || quiz.cta_settings?.url;

    const generateShareImage = async (): Promise<Blob | null> => {
        if (!resultsCardRef.current) return null;

        setIsGeneratingImage(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const canvas = await html2canvas(resultsCardRef.current, {
                backgroundColor: '#f8fafc',
                scale: 2,
                useCORS: true,
                logging: false,
            } as any);

            return new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
            });
        } catch (error) {
            console.error('Failed to generate image:', error);
            return null;
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadImage = async () => {
        const blob = await generateShareImage();
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${quiz.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-results.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Generate share text based on outcome/score
    const getShareText = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email') => {
        const resultText = outcome
            ? `I got "${outcome.name}"`
            : `I scored ${submission.total_score} points`;
        
        const baseText = `${resultText} on the ${quiz.title} quiz!`;
        
        switch (platform) {
            case 'twitter':
                return `🎯 ${baseText} Can you beat my score? Take the quiz and find out! 👇`;
            case 'facebook':
                return `🎯 ${baseText}\n\nThink you can do better? Take the quiz and challenge me!`;
            case 'linkedin':
                return `I just completed the "${quiz.title}" quiz and ${outcome ? `got "${outcome.name}"` : `scored ${submission.total_score} points`}!\n\nIt was a great way to test my knowledge. Try it yourself and see how you compare!`;
            case 'whatsapp':
                return `🎯 ${baseText}\n\nThink you can beat my score? Take the quiz here:`;
            case 'email':
                return `Hey!\n\n${baseText}\n\nI thought you might enjoy taking this quiz too. Click the link below to try it:\n\n${window.location.href}\n\nLet me know how you do!`;
            default:
                return baseText;
        }
    };

    const getEmailSubject = () => {
        return outcome
            ? `I got "${outcome.name}" on ${quiz.title} - Try it!`
            : `Check out my score on ${quiz.title}!`;
    };

    const handleShareTwitter = () => {
        const text = getShareText('twitter');
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    const handleShareFacebook = () => {
        // Facebook uses quote parameter for pre-filled text
        const text = getShareText('facebook');
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    const handleShareLinkedIn = () => {
        // LinkedIn uses title and summary for pre-filled content
        const text = getShareText('linkedin');
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    const handleShareWhatsApp = () => {
        const text = `${getShareText('whatsapp')} ${window.location.href}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleShareEmail = () => {
        const subject = getEmailSubject();
        const body = getShareText('email');
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleNativeShare = async () => {
        if (!navigator.share) {
            handleCopyLink();
            return;
        }

        const shareData: ShareData = {
            title: `${quiz.title} - My Results`,
            text: outcome ? `I got: ${outcome.name}` : `My score: ${submission.total_score}`,
            url: window.location.href,
        };

        // Try to share with image if Web Share API Level 2 is supported
        if (navigator.canShare) {
            const blob = await generateShareImage();
            if (blob) {
                const file = new File([blob], 'quiz-results.png', { type: 'image/png' });
                const shareWithImage = { ...shareData, files: [file] };
                if (navigator.canShare(shareWithImage)) {
                    try {
                        await navigator.share(shareWithImage);
                        return;
                    } catch {
                        // Fall through to share without image
                    }
                }
            }
        }

        try {
            await navigator.share(shareData);
        } catch {
            // User cancelled or share failed
        }
    };

    return (
        <>
            <Head title={`Results - ${quiz.title}`} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="mx-auto max-w-2xl px-4 py-12">
                    {/* Results Card */}
                    <Card ref={resultsCardRef} className="border-0 shadow-xl">
                        <CardHeader className="text-center">
                            <div
                                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                                style={{ backgroundColor: `${primaryColor}20` }}
                            >
                                <Award className="h-8 w-8" style={{ color: primaryColor }} />
                            </div>
                            <CardTitle className="text-3xl">
                                {outcome ? outcome.name : 'Quiz Complete!'}
                            </CardTitle>
                            <CardDescription className="mt-2 text-base">
                                {outcome 
                                    ? outcome.description 
                                    : 'Thank you for completing the quiz. Here are your results.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Score Display */}
                            <div className="rounded-lg bg-slate-50 p-6 text-center">
                                <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                    Your Score
                                </div>
                                <div
                                    className="mt-2 text-5xl font-bold"
                                    style={{ color: primaryColor }}
                                >
                                    {submission.total_score}
                                </div>
                            </div>

                            {/* Dimension Scores */}
                            {submission.dimension_scores && Object.keys(submission.dimension_scores).length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold">Score Breakdown</h3>
                                    <div className="space-y-2">
                                        {Object.entries(submission.dimension_scores).map(([dimension, score]) => (
                                            <div key={dimension} className="flex items-center justify-between">
                                                <span className="text-muted-foreground">{dimension}</span>
                                                <span className="font-semibold">{score}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Content Blocks */}
                            {outcome?.content_blocks && outcome.content_blocks.length > 0 && (
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="font-semibold">What's Next</h3>
                                    {outcome.content_blocks.map((block, index) => (
                                        <div key={index} className="prose prose-slate max-w-none">
                                            {block.type === 'text' && <p>{block.content}</p>}
                                            {block.type === 'link' && (
                                                <a
                                                    href={block.content}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-primary hover:underline"
                                                    style={{ color: primaryColor }}
                                                >
                                                    {block.content}
                                                    <ExternalLink className="ml-1 h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Share Your Results Section */}
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-center font-semibold">Share Your Results</h3>
                                
                                {/* Social Share Buttons */}
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleShareTwitter}
                                        className="flex items-center gap-2 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
                                    >
                                        <Twitter className="h-5 w-5" />
                                        <span className="hidden sm:inline">X / Twitter</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleShareFacebook}
                                        className="flex items-center gap-2 hover:bg-[#1877F2]/10 hover:border-[#1877F2] hover:text-[#1877F2]"
                                    >
                                        <Facebook className="h-5 w-5" />
                                        <span className="hidden sm:inline">Facebook</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleShareLinkedIn}
                                        className="flex items-center gap-2 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2] hover:text-[#0A66C2]"
                                    >
                                        <Linkedin className="h-5 w-5" />
                                        <span className="hidden sm:inline">LinkedIn</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleShareWhatsApp}
                                        className="flex items-center gap-2 hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#25D366]"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span className="hidden sm:inline">WhatsApp</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleShareEmail}
                                        className="flex items-center gap-2 hover:bg-slate-100"
                                    >
                                        <Mail className="h-5 w-5" />
                                        <span className="hidden sm:inline">Email</span>
                                    </Button>
                                </div>

                                {/* Download & Copy Actions */}
                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                                    <Button
                                        variant="secondary"
                                        onClick={handleDownloadImage}
                                        disabled={isGeneratingImage}
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        {isGeneratingImage ? 'Generating...' : 'Download Image'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCopyLink}
                                        className="flex items-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Link Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Link2 className="h-4 w-4" />
                                                Copy Link
                                            </>
                                        )}
                                    </Button>
                                    {canNativeShare && (
                                        <Button
                                            variant="secondary"
                                            onClick={handleNativeShare}
                                            className="flex items-center gap-2"
                                        >
                                            <Share2 className="h-4 w-4" />
                                            More Options
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* CTA Action */}
                            {ctaUrl && (
                                <div className="border-t pt-6">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full hover:opacity-90"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                                            {ctaLabel}
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>Powered by D'Quizz</p>
                    </div>
                </div>
            </div>
        </>
    );
}
