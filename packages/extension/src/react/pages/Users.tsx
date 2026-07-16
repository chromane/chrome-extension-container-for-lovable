import { Alert, AlertAction, AlertDescription, AlertTitle } from '@src/components/ui/alert';
import { Button } from '@src/components/ui/button';
import { AlertTriangleIcon, InfoIcon } from 'lucide-react';
const Users = () => {
  return (
    <div>
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
    </div>
  );
};
export default Users;
