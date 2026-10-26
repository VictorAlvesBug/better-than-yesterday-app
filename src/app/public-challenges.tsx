import { getColor } from '@/types/color.type'
import { ChallengeStatus, ChallengeToJoin } from '@/types/challenge.type'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Memory from '../api/memory'
import Icon from '../components/icon'
import JoinChallengeModal from '../components/join-challenge-modal'
import ChallengeCard from '../components/challenge-card'
import ScreenHeader from '../components/screen-header'
import ScreenLayout from '../components/screen-layout'
import { useRepositories } from '../hooks/useRepositories'

export default function PublicChallengesScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState('');
    const [challenges, setChallenges] = useState<ChallengeToJoin[]>([]);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const { challenge: challengeRepository } = useRepositories();

    const pseudoRefreshChallenge = useCallback((challengeId: string, joined: boolean) => {
        setChallenges(prev => prev.map(challenge => {
            if (challenge.id === challengeId)
                return { ...challenge, joined: joined };

            return challenge;
        }))
    }, []);

    const statusPriority = (status: ChallengeStatus) => {
        switch (status) {
            case 'NotStarted': return 0;
            case 'Running': return 1;
            case 'Finished': return 2;
            case 'Cancelled': return 3;
        }
    }

    const loadChallenges = useCallback(async (showLoading = true) => {
        if (showLoading)
            setLoading(true);

        try {
            const storedUserId = await Memory.get('userId');

            if (!storedUserId)
                return;

            setUserId(storedUserId);

            const userWithChallengesPromise = challengeRepository.getUserWithChallengesByUserId(storedUserId);
            const publicChallengesPromise = challengeRepository.list({ type: 'Public' });
            const [userWithChallenges, publicChallenges] = await Promise.all([userWithChallengesPromise, publicChallengesPromise]);

            setChallenges(
                publicChallenges.filter(publicChallenge => publicChallenge.status !== 'Cancelled')
                    .sort((a, b) => statusPriority(a.status) - statusPriority(b.status))
                    .map(publicChallenge => ({
                        ...publicChallenge,
                        joined: userWithChallenges.challenges.some(challenge => challenge.id === publicChallenge.id)
                    } satisfies ChallengeToJoin))
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [challengeRepository]);

    useEffect(() => {
        loadChallenges();
    }, [loadChallenges]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadChallenges(false);
    }, [loadChallenges]);

    const openJoinModal = useCallback(() => {
        setIsJoinModalOpen(true);
    }, []);

    const renderEmpty = useCallback(() => {
        if (loading) {
            return (
                <View className="flex flex-row items-center justify-center py-8">
                    <ActivityIndicator size="large" color={getColor("gray-6")} />
                </View>
            );
        }

        return (
            <View className="flex flex-row items-center justify-center gap-4 py-8">
                <Text style={{ color: getColor("gray-4") }} className="text-base">
                    Nenhum desafio nessa arena ainda
                </Text>
            </View>
        );
    }, [loading]);

    const renderItem = useCallback(({ item }: { item: ChallengeToJoin }) => (
        <ChallengeCard
            challenge={item}
            userId={userId}
            callback={pseudoRefreshChallenge}
        />
    ), [userId, pseudoRefreshChallenge]);

    return (
        <ScreenLayout
            header={
                <ScreenHeader
                    title="Desafios em alta"
                    right={
                        <Pressable className="flex items-center justify-center w-20 h-20" onPress={openJoinModal}>
                            <Icon name="link-outline" size={24} color="white" />
                        </Pressable>
                    }
                />
            }
        >
            <JoinChallengeModal
                visible={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
            <FlatList
                data={challenges}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={{ flexGrow: 1, paddingTop: 16 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={getColor('violet')}
                        colors={[getColor('violet')]}
                    />
                }
            />
        </ScreenLayout>
    )
}
