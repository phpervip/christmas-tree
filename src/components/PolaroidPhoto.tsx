// 创建一个新文件 PolaroidPhoto.tsx
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

interface PolaroidPhotoProps {
  url: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  id: string;
  shouldLoad: boolean;
  year: number;
}

const PolaroidPhoto: React.FC<PolaroidPhotoProps> = ({ 
  url, 
  position, 
  rotation, 
  scale, 
  id, 
  shouldLoad, 
  year 
}) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loadStatus, setLoadStatus] = useState<'pending' | 'loading' | 'local' | 'fallback'>('pending');

  useEffect(() => {
    if (!shouldLoad || loadStatus !== 'pending') return;

    setLoadStatus('loading');
    const loader = new THREE.TextureLoader();

    // 先尝试加载本地照片
    loader.load(
      url,
      (tex) => {
        // 本地照片加载成功
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        setTexture(tex);
        setLoadStatus('local');
        console.log(`✅ Successfully loaded local image: ${url}`, {
          width: tex.image?.width,
          height: tex.image?.height,
          format: tex.format,
          type: tex.type
        });
      },
      undefined, // onProgress
      (error) => {
        // 本地照片加载失败，使用 Picsum 随机照片
        console.warn(`⚠️ Local image not found: ${url}, loading random photo...`);
        const seed = id.split('-')[1] || '55';
        const fallbackUrl = `https://picsum.photos/seed/${parseInt(seed) + 100}/400/500`;

        loader.load(
          fallbackUrl,
          (fbTex) => {
            fbTex.colorSpace = THREE.SRGBColorSpace;
            fbTex.wrapS = THREE.ClampToEdgeWrapping;
            fbTex.wrapT = THREE.ClampToEdgeWrapping;
            fbTex.needsUpdate = true;
            setTexture(fbTex);
            setLoadStatus('fallback');
            console.log(`✅ Loaded fallback image for ${url}`);
          },
          undefined,
          (fallbackError) => {
            console.error(`❌ Failed to load both local and fallback images for ${url}`, fallbackError);
          }
        );
      }
    );
  }, [url, id, shouldLoad, loadStatus]);

  // 在移动设备上降低渲染复杂度
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const renderScale = isMobile ? scale * 1.0 : scale * 1.2;

  return (
    <group position={position} rotation={rotation} scale={renderScale}>
      {/* 相框边框 - 白色边框 */}
      <mesh position={[0, 0, 0]} userData={{ photoId: id, photoUrl: url }}>
        <boxGeometry args={[1, 1.25, 0.02]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* 照片内容 - 方案1: meshStandardMaterial */}
      <mesh position={[0, 0.15, 0.015]} userData={{ photoId: id, photoUrl: url }}>
        <planeGeometry args={[0.9, 0.9]} />
        {texture ? (
          <meshStandardMaterial
            key={texture.uuid}
            map={texture}
            roughness={0.5}
            metalness={0.0}
          />
        ) : (
          <meshStandardMaterial color="#333" />
        )}
      </mesh>
      {/* 扫光效果覆盖层 - 在移动端禁用以提高性能 */}
      {!isMobile && (
        <mesh position={[0, 0.15, 0.02]} scale={[0.9, 0.9, 1]}>
          <planeGeometry args={[1, 1]} />
          <shimmerMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  );
};

export default PolaroidPhoto;