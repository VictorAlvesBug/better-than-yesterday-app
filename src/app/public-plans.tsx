import { getColor } from '@/types/color.type'
import { PlanStatus, PlanToJoin } from '@/types/plan.type'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Memory from '../api/memory'
import Icon from '../components/icon'
import JoinPlanModal from '../components/join-plan-modal'
import PlanCard from '../components/plan-card'
import ScreenHeader from '../components/screen-header'
import ScreenLayout from '../components/screen-layout'
import { useRepositories } from '../hooks/useRepositories'

export default function PublicPlansScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState('');
    const [plans, setPlans] = useState<PlanToJoin[]>([]);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const { plan: planRepository } = useRepositories();

    const pseudoRefreshPlan = useCallback((planId: string, joined: boolean) => {
        setPlans(prev => prev.map(plan => {
            if (plan.id === planId)
                return { ...plan, joined: joined };

            return plan;
        }))
    }, []);

    const statusPriority = (status: PlanStatus) => {
        switch (status) {
            case 'NotStarted': return 0;
            case 'Running': return 1;
            case 'Finished': return 2;
            case 'Cancelled': return 3;
        }
    }

    const loadPlans = useCallback(async (showLoading = true) => {
        if (showLoading)
            setLoading(true);

        try {
            const storedUserId = await Memory.get('userId');

            if (!storedUserId)
                return;

            setUserId(storedUserId);

            const userWithPlansPromise = planRepository.getUserWithPlansByUserId(storedUserId);
            const publicPlansPromise = planRepository.list({ type: 'Public' });
            const [userWithPlans, publicPlans] = await Promise.all([userWithPlansPromise, publicPlansPromise]);

            setPlans(
                publicPlans.filter(publicPlan => publicPlan.status !== 'Cancelled')
                    .sort((a, b) => statusPriority(a.status) - statusPriority(b.status))
                    .map(publicPlan => ({
                        ...publicPlan,
                        joined: userWithPlans.plans.some(plan => plan.id === publicPlan.id)
                    } satisfies PlanToJoin))
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [planRepository]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadPlans(false);
    }, [loadPlans]);

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
                    Nenhum plano encontrado
                </Text>
            </View>
        );
    }, [loading]);

    const renderItem = useCallback(({ item }: { item: PlanToJoin }) => (
        <PlanCard
            plan={item}
            userId={userId}
            callback={pseudoRefreshPlan}
        />
    ), [userId, pseudoRefreshPlan]);

    return (
        <ScreenLayout
            header={
                <ScreenHeader
                    title="Planos Populares"
                    right={
                        <Pressable className="flex items-center justify-center w-20 h-20" onPress={openJoinModal}>
                            <Icon name="link-outline" size={24} color="white" />
                        </Pressable>
                    }
                />
            }
        >
            <JoinPlanModal
                visible={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
            <FlatList
                data={plans}
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
