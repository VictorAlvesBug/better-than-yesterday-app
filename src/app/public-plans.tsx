import { getColor } from '@/types/color.type'
import { PlanStatus, PlanToJoin } from '@/types/plan.type'
import Constants from 'expo-constants'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import Memory from '../api/memory'
import BackButton from '../components/back-button'
import GradientView from '../components/gradient-view'
import Icon from '../components/icon'
import PlanCard from '../components/plan-card'
import { useRepositories } from '../hooks/useRepositories'

export default function PublicPlansScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [plans, setPlans] = useState<PlanToJoin[]>([]);
    const { plan: planRepository } = useRepositories();

    const pseudoRefreshPlan = (planId: string, joined: boolean) => {
        setPlans(prev => prev.map(plan => {
            if (plan.id === planId)
                return { ...plan, joined: joined };

            return plan;
        }))
    }

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
            const userId = await Memory.get('userId');

            if (!userId)
                return;

            const userWithPlansPromise = planRepository.getUserWithPlansByUserId(userId);
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

    return (
        <View
            className="relative flex-1"
            style={{ backgroundColor: getColor("gray-e") }}
        >
            <ScrollView
                style={{ flex: 1 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={getColor('violet')}
                        colors={[getColor('violet')]}
                    />
                }
            >
                <GradientView
                    style={{ paddingTop: Constants.statusBarHeight }}
                    className="flex flex-row items-center justify-center w-full"
                >
                    <BackButton />
                    <Text style={{ color: getColor("white") }} className="flex-1 text-xl font-bold text-left">
                        Planos Populares
                    </Text>
                    <Pressable className="flex items-center justify-center w-20 h-20" onPress={() => { }}>
                        <Icon name="link-outline" size={24} color="white" />
                    </Pressable>
                </GradientView>

                <View className="flex flex-col items-center justify-center gap-4 p-4 w-full">
                    {loading && (
                        <ActivityIndicator size="large" color={getColor("gray-6")} />
                    )}
                    {!loading && plans.length === 0 && (
                        <View className="flex flex-row items-center justify-center gap-4">
                            <Text style={{ color: getColor("gray-4") }} className="text-base">
                                Nenhum plano encontrado
                            </Text>
                        </View>
                    )}
                    <View className="flex flex-col w-full gap-3">
                        {!loading && plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                callback={pseudoRefreshPlan}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}
