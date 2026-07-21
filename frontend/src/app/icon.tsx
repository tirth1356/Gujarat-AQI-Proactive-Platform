import { ImageResponse } from 'next/og'

export const size = {
  width: 64,
  height: 64,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #9a3412 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          border: '3px solid #ffffff',
          boxShadow: '0 0 16px #d97706',
        }}
      >
        <div
          style={{
            background: '#171717',
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b',
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '-1px',
          }}
        >
          G
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
