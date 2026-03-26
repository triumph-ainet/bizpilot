import { Suspense } from 'react';
import ResetPasswordClient from './_components/ResetPasswordClient';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
