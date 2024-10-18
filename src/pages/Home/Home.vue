<template>
    <nav>
        <div>
            <h2>Clientes</h2>
            <div :class="cardContainerClass">
                <CardComponent>
                    <p>Clientes cadastrados</p>
                    <div :class="registryDataClass">
                        <img src="@/assets/town.png" alt="">
                        <span>{{ clientsData.length }}</span>
                        <small v-if="recentClientsCount > 0">+{{ recentClientsCount }}</small>
                    </div>
                </CardComponent>
                <CardComponent :redirect="{ image: require('@/assets/clients.png'), text: 'Gerenciar clientes' }" :click="redirectToClientManager" />
            </div>
        </div>
        <div>
            <h4>Certificados digitais</h4>
            <div :class="cardContainerClass">
                <CardComponent>
                    <div :class="analyticContainerClass">
                        <div :class="analyticClass">
                            <span :class="circleGreenClass"></span>
                            <span><strong>{{ integratedCount }}</strong> integrados</span>
                        </div>
                        <div :class="analyticClass">
                            <span :class="circleYellowClass"></span>
                            <span><strong>{{ expiringSoonCount }}</strong> vencem em breve</span>
                        </div>
                        <div :class="analyticClass">
                            <span :class="circleRedClass"></span>
                            <span><strong>{{ expiredCount }}</strong> vencidos</span>
                        </div>
                    </div>
                </CardComponent>
                <CardComponent :redirect="{ image: require('@/assets/certificate.png'), text: 'Gerenciar certificados' }" :click="redirectToCertificateManager" />
            </div>
        </div>
    </nav>
</template>

<script>
import styles from './Home.module.scss';
import CardComponent from '@/components/Card/Card.vue';
import { ref, get } from 'firebase/database';
import { db } from '@/firebaseDb';

export default {
    name: 'HomePage',
    components: {
        CardComponent
    },
    data() {
        return {
            clientsData: [],
            certificates: [],
            recentClientsCount: 0,
            integratedCount: 0,
            expiringSoonCount: 0,
            expiredCount: 0
        };
    },
    computed: {
        cardContainerClass() {
            return styles.card_container;
        },
        registryDataClass() {
            return styles.registry_data;
        },
        analyticClass() {
            return styles.analytic;
        },
        circleGreenClass() {
            return `${styles.circle} ${styles['circle--green']}`;
        },
        circleYellowClass() {
            return `${styles.circle} ${styles['circle--yellow']}`;
        },
        circleRedClass() {
            return `${styles.circle} ${styles['circle--red']}`;
        },
    },
    methods: {
        redirectToClientManager() {
            this.$router.push('/client-manager');
        },
        redirectToCertificateManager() {
            this.$router.push('/certificate-manager');
        },
        async fetchClientsData() {
            try {
                const clientsRef = ref(db, 'clients');
                const snapshot = await get(clientsRef);
                const data = snapshot.val();
                if (data) {
                    this.clientsData = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));

                    const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
                    const recentClients = this.clientsData.filter(client => {
                        const clientDate = new Date(client.date).getTime();
                        return clientDate >= sixHoursAgo;
                    });

                    this.recentClientsCount = recentClients.length;
                }
            } catch (error) {
                console.error('Erro ao buscar os dados dos clientes:', error);
            }
        },
        async fetchCertificatesData() {
            try {
                const certificatesRef = ref(db, 'certificates');
                const snapshot = await get(certificatesRef);
                const certificatesData = snapshot.val();
                if (certificatesData) {
                    this.certificates = Object.keys(certificatesData).map(key => ({
                        id: key,
                        ...certificatesData[key],
                        validUntil: this.calculateValidUntil(certificatesData[key].validity)
                    }));

                    this.categorizeCertificates();
                }
            } catch (error) {
                console.error('Erro ao buscar os dados dos certificados:', error);
            }
        },
        calculateValidUntil(validity) {
            const now = new Date();
            let duration;

            switch (validity) {
                case '6 meses':
                    duration = 6;
                    break;
                case '1 ano':
                    duration = 12;
                    break;
                case '4 anos':
                    duration = 48;
                    break;
                default:
                    duration = 0;
            }

            now.setMonth(now.getMonth() + duration);
            return now;
        },
        categorizeCertificates() {
            const now = new Date();
            const threeMonthsInMs = 3 * 30 * 24 * 60 * 60 * 1000;

            this.integratedCount = 0;
            this.expiringSoonCount = 0;
            this.expiredCount = 0;

            this.certificates.forEach(certificate => {
                const timeRemaining = certificate.validUntil.getTime() - now.getTime();

                if (timeRemaining <= 0) {
                    this.expiredCount++;
                } else if (timeRemaining <= threeMonthsInMs) {
                    this.expiringSoonCount++;
                } else {
                    this.integratedCount++;
                }
            });
        }
    },
    created() {
        this.fetchClientsData();
        this.fetchCertificatesData();
    }
};
</script>
