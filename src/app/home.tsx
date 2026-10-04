import Memory from '@/src/api/memory';
import createPlanRepository from '@/src/api/planRepository';
import createUserRepository from '@/src/api/userRepository';
import { getColor } from '@/types/color.type';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/auth';
import CreateUserScreen from './create-user';
import LoginScreen from './login';
import ManagePlansScreen from './manage-plans';
import NotFoundScreen from './not-found';
import PlanTrackerScreen from './plan-tracker';

type RedirectionScreen = 'loading' | 'not-found' | 'login' | 'create-user' | 'plan-tracker' | 'manage-plans';

export default function HomeScreen() {
    const { isSignedIn, authUser } = useAuth();
    const [redirectionScreen, setRedirectionScreen] = React.useState<RedirectionScreen>('loading');
    const userRepository = useMemo(() => createUserRepository(), []);
    const planRepository = useMemo(() => createPlanRepository(), []);

    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7592/ingest/3ca86e35-fb03-43a9-869d-50a6c2ae00ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f797c0'},body:JSON.stringify({sessionId:'f797c0',runId:'pre',hypothesisId:'C',location:'home.tsx:effect',message:'home effect ran',data:{isSignedIn,hasAuthUser:Boolean(authUser),redirectionScreen},timestamp:Date.now()})}).catch(()=>{});
        console.log('[debug-f797c0]', JSON.stringify({hypothesisId:'C',message:'home effect ran',isSignedIn,hasAuthUser:Boolean(authUser),redirectionScreen}));
        // #endregion
        if (!isSignedIn || !authUser)
            return;

        const fetchData = async () => {
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

        fetchData();
    }, []);

    setTimeout(() => {
        setRedirectionScreen(prev => {
            const next = prev === 'loading' ? (isSignedIn ? 'not-found' : 'login') : prev;
            if (prev === 'loading') {
                // #region agent log
                fetch('http://127.0.0.1:7592/ingest/3ca86e35-fb03-43a9-869d-50a6c2ae00ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f797c0'},body:JSON.stringify({sessionId:'f797c0',runId:'pre',hypothesisId:'C',location:'home.tsx:timeout',message:'loading timeout chose screen',data:{isSignedIn,prev,next},timestamp:Date.now()})}).catch(()=>{});
                console.log('[debug-f797c0]', JSON.stringify({hypothesisId:'C',message:'loading timeout chose screen',isSignedIn,prev,next}));
                // #endregion
            }
            return next;
        });
    }, 2000)

    console.log({ redirectionScreen });

    switch (redirectionScreen) {
        case 'loading':
            return <View className="flex flex-row items-center justify-center h-full">
                <ActivityIndicator size="large" color={getColor("gray-6")} />
            </View>
        case 'login':
            return <LoginScreen />;
        case 'create-user':
            return <CreateUserScreen />;
        case 'plan-tracker':
            return <PlanTrackerScreen />;
        case 'manage-plans':
            return <ManagePlansScreen />;
        case 'not-found':
        default:
            return <NotFoundScreen />;
    }
}
