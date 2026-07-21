import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px',
          border: '2px solid #ffffff',
          fontWeight: 900,
          boxShadow: '0 0 10px #d97706',
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  )
}
