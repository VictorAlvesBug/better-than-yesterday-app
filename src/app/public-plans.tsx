import { getColor } from '@/types/color.type'
import { PlanWithHabitToJoin } from '@/types/plan.type'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Memory from '../api/memory'
import createPlanRepository from '../api/planRepository'
import BackButton from '../components/back-button'
import GradientView from '../components/gradient-view'
import PlanCard from '../components/plan-card'
import useEffectAsync from '../hooks/useEffectAsync'

export default function PublicPlansScreen() {
    const [plans, setPlans] = useState<PlanWithHabitToJoin[]>([]);
    const planRepository = createPlanRepository();

    const pseudoRefreshPlan = (planId: string, joined: boolean) => {
        setPlans(prev => prev.map(plan => {
            if(plan.id === planId)
                return { ...plan, joined: joined };

            return plan;
        }))
    }

    useEffectAsync(async () => {
        const userId = await Memory.get('userId') || '';// TODO: Always logout user if userId was not found

        const joinedPlanIds = (await planRepository.joinedPlans(userId))
            .map(joinedPlan => joinedPlan.id);

        const publicPlans = (await planRepository.listPublic())
            .map(publicPlan => {
                return {
                    ...publicPlan,
                    joined: joinedPlanIds.includes(publicPlan.id)
                } satisfies PlanWithHabitToJoin;
            });

            console.log(publicPlans.length)
            
        setPlans(publicPlans);
    }, []);

    return (
        <View
            className="relative flex-1"
            style={{ backgroundColor: getColor("gray-e") }}
        >
            <ScrollView
                style={{ flex: 1 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
            >
                <GradientView
                    style={{
                        paddingTop: Constants.statusBarHeight,
                    }}
                    className="flex flex-row items-center justify-center w-full"
                >
                    <BackButton />
                    <Text style={{ color: getColor("white") }} className="flex-1 text-lg font-bold text-left">
                        Planos Populares
                    </Text>
                    <Pressable
                        className="flex items-center justify-center w-20 h-20"
                        onPress={() => { }}
                    >
                        <Ionicons name="link-outline" size={24} color="#fff" />
                    </Pressable>
                </GradientView>

                <View
                    className={`flex flex-col items-center justify-center gap-4 p-4 w-full`}
                >
                    {plans.length === 0 && (
                        <View className="flex flex-row items-center justify-center gap-4">
                            <Text style={{ color: getColor("gray-4") }} className="text-base">
                                Nenhum plano encontrado
                            </Text>
                        </View>
                    )}
                    <View className="flex flex-col w-full gap-3">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                //callback={pseudoRefreshPlan}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}
