'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Image from 'next/image';

interface AppImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    fill?: boolean;
    /** Shows the full image over a softly blurred, enlarged copy to fill empty frame space. */
    smartFill?: boolean;
    sizes?: string;
    onClick?: () => void;
    fallbackSrc?: string;
    loading?: 'lazy' | 'eager';
    unoptimized?: boolean;
    [key: string]: any;
}

const AppImage = memo(function AppImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    quality = 85,
    placeholder = 'empty',
    blurDataURL,
    fill = false,
    smartFill = false,
    sizes,
    onClick,
    fallbackSrc = '/assets/images/no_image.png',
    loading = 'lazy',
    unoptimized = false,
    style,
    ...props
}: AppImageProps) {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImageSrc(src || fallbackSrc);
        setHasError(false);
        setIsLoading(true);
    }, [src, fallbackSrc]);

    const isRemoteOrDataUrl = useMemo(() => typeof imageSrc === 'string' && (imageSrc.startsWith('http') || imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')), [imageSrc]);
    const resolvedUnoptimized = unoptimized || isRemoteOrDataUrl;

    const handleError = useCallback(() => {
        if (!hasError && imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
            setHasError(true);
        }
        setIsLoading(false);
    }, [hasError, imageSrc, fallbackSrc]);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
        setHasError(false);
    }, []);

    const imageClassName = useMemo(() => {
        const classes = [className];
        if (isLoading) classes.push('bg-gray-200');
        if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-200');
        return classes.filter(Boolean).join(' ');
    }, [className, isLoading, onClick]);

    const imageProps = useMemo(() => {
        const baseProps: any = {
            src: imageSrc,
            alt,
            className: imageClassName,
            quality,
            placeholder,
            unoptimized: resolvedUnoptimized,
            onError: handleError,
            onLoad: handleLoad,
            onClick,
        };

        if (priority) {
            baseProps.priority = true;
        } else {
            baseProps.loading = loading;
        }

        if (blurDataURL && placeholder === 'blur') {
            baseProps.blurDataURL = blurDataURL;
        }

        return baseProps;
    }, [imageSrc, alt, imageClassName, quality, placeholder, blurDataURL, resolvedUnoptimized, priority, loading, handleError, handleLoad, onClick]);

    if (fill) {
        return (
            <div className="relative h-full w-full overflow-hidden" style={{ width: '100%', height: '100%', background: '#16090b' }}>
                {smartFill && (
                    <Image
                        src={imageSrc}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
                        quality={60}
                        unoptimized={resolvedUnoptimized}
                        draggable={false}
                        style={{
                            objectFit: 'cover',
                            filter: 'blur(18px)',
                            transform: 'scale(1.12)',
                            opacity: 0.72,
                        }}
                    />
                )}
                <Image
                    {...imageProps}
                    fill
                    sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
                    style={{ objectFit: 'contain', ...(style || {}) }}
                    {...props}
                />
            </div>
        );
    }

    return (
        <Image
            {...imageProps}
            width={width || 400}
            height={height || 300}
            sizes={sizes}
            style={{ objectFit: 'contain', ...(style || {}) }}
            {...props}
        />
    );
});

AppImage.displayName = 'AppImage';

export default AppImage;