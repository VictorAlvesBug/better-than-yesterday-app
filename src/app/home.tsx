import Memory from '@/src/api/memory';
import createPlanRepository from '@/src/api/planRepository';
import createUserRepository from '@/src/api/userRepository';
import React, { useEffect } from 'react';
import { useAuth } from '../context/auth';
import CreateUserScreen from './create-user';
import LoginScreen from './login';
import ManagePlansScreen from './manage-plans';
import PlanTrackerScreen from './plan-tracker';

type RedirectionScreen = 'initial' | 'login' | 'create-user' | 'plan-tracker' | 'manage-plans';

export default function HomeScreen() {
    const { isSignedIn, authUser } = useAuth();
    const [redirectionScreen, setRedirectionScreen] = React.useState<RedirectionScreen>('initial');
    const userRepository = createUserRepository();
    const planRepository = createPlanRepository();

    useEffect(() => {
        if (!isSignedIn || !authUser)
            return;

        const fetchUser = async () => {
            const dbUser = await userRepository.get({ email: authUser.email }).catch(() => {
                setRedirectionScreen('create-user');
                return;
            });

            if (!dbUser) {
                setRedirectionScreen('create-user');
                return;
            }

            await Memory.set('userId', dbUser.id);

            const plans = await planRepository.listByUserId(dbUser.id);
            const lastAccessedPlanId = await Memory.get('planId');

            if (plans.length === 0) {
                setRedirectionScreen('manage-plans');
                return;
            }

            if (plans.some(plan => plan.id === lastAccessedPlanId)) {
                setRedirectionScreen('plan-tracker');
                return;
            }

            await Memory.set('planId', plans[0].id);
            setRedirectionScreen('plan-tracker');
        };

        fetchUser();
    }, [authUser, isSignedIn, planRepository, userRepository]);

    switch (redirectionScreen) {
        case 'login':
            return <LoginScreen />;
        case 'create-user':
            return <CreateUserScreen />;
        case 'plan-tracker':
            return <PlanTrackerScreen />;
        case 'manage-plans':
            return <ManagePlansScreen />;
        case 'initial':
        default:
            return null;
    }
}
