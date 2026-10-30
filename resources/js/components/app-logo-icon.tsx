import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/logo-mark.png" alt="D'Quizz logo" {...props} />;
}
