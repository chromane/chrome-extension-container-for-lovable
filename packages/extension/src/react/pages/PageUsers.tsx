import { Alert, AlertAction, AlertDescription, AlertTitle } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import { AlertTriangleIcon, InfoIcon, CheckCircle2Icon } from 'lucide-react';

const Users = () => {
  return (
    <div>
      <div className='grid w-full max-w-md items-start gap-4'>
        <Alert variant='default'>
          <InfoIcon />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components and dependencies to your app using the cli.</AlertDescription>
        </Alert>
        <Alert variant='destructive'>
          <InfoIcon />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components and dependencies to your app using the cli.</AlertDescription>
        </Alert>
        <Alert className='max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50'>
          <AlertTriangleIcon />
          <AlertTitle>Your subscription will expire in 3 days.</AlertTitle>
          <AlertDescription>Renew now to avoid service interruption or upgrade to a paid plan to continue using the service.</AlertDescription>
        </Alert>

        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Payment successful</AlertTitle>
          <AlertDescription>Your payment of $29.99 has been processed. A receipt has been sent to your email address.</AlertDescription>
        </Alert>
        <Alert>
          <InfoIcon />
          <AlertTitle>New feature available</AlertTitle>
          <AlertDescription>We&apos;ve added dark mode support. You can enable it in your account settings.</AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
export default Users;
