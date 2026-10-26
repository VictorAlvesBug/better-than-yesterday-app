import Memory from '@/src/api/memory';
import createChallengeRepository from '@/src/api/challengeRepository';
import createUserRepository from '@/src/api/userRepository';
import { getColor } from '@/types/color.type';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/auth';
import CreateUserScreen from './create-user';
import LoginScreen from './login';
import ManageChallengesScreen from './manage-challenges';
import NotFoundScreen from './not-found';
import ChallengeTrackerScreen from './challenge-tracker';

type RedirectionScreen = 'loading' | 'not-found' | 'login' | 'create-user' | 'challenge-tracker' | 'manage-challenges';

export default function HomeScreen() {
    const { isSignedIn, authUser } = useAuth();
    const [redirectionScreen, setRedirectionScreen] = React.useState<RedirectionScreen>('loading');
    const userRepository = useMemo(() => createUserRepository(), []);
    const challengeRepository = useMemo(() => createChallengeRepository(), []);

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

            const challenges = await challengeRepository.listByUserId(dbUser.id);
            const lastAccessedChallengeId = await Memory.get('challengeId');

            if (challenges.length === 0) {
                setRedirectionScreen('manage-challenges');
                return;
            }

            if (challenges.some(challenge => challenge.id === lastAccessedChallengeId)) {
                setRedirectionScreen('challenge-tracker');
                return;
            }

            await Memory.set('challengeId', challenges[0].id);
            setRedirectionScreen('challenge-tracker');
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
        case 'challenge-tracker':
            return <ChallengeTrackerScreen />;
        case 'manage-challenges':
            return <ManageChallengesScreen />;
        case 'not-found':
        default:
            return <NotFoundScreen />;
    }
}
