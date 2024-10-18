<template>
    <div>
        <div :class="headerContainerClass">
            <router-link :class="returnClass" style="height: fit-content;" to="/">
                <img src="@/assets/arrow-right.svg" alt="Logo" />
            </router-link>
            <h1>Gerenciar certificados</h1>
            <button :class="addButtonClass" @click="addCertificateCard">Adicionar</button>
        </div>
        <div :class="cardContainerClass">
            <CardComponent v-for="(certificate, index) in certificates" :key="certificate.id || index">
                <img v-if="!certificate.editing" :class="trashIconClass" src="../../assets/trash.png" alt="Remover certificado" @click="removeCertificate(certificate.id, index)">
                <div>
                    <div>
                        <div>
                            <div v-if="certificate.editing">
                                <select v-model="certificate.type">
                                    <option value="" disabled selected>Selecione o tipo de certificado</option>
                                    <option value="Front End Developer">Front End Developer</option>
                                    <option value="Back End Developer">Back End Developer</option>
                                    <option value="Full Stack Developer">Full Stack Developer</option>
                                </select>
                            </div>
                            <div v-else>
                                <span :class="certificate_render">{{ certificate.type || 'Nenhum tipo selecionado' }}</span>
                            </div>
                        </div>
                        <div>
                            <div v-if="certificate.editing">
                                <select v-model="certificate.validity">
                                    <option value="" disabled selected>Selecione o prazo de validade</option>
                                    <option value="6 meses">6 meses</option>
                                    <option value="1 ano">1 ano</option>
                                    <option value="4 anos">4 anos</option>
                                </select>
                            </div>
                            <div v-else>
                                <span>Validade: {{ certificate.validity || 'Nenhum prazo selecionado' }}</span>
                            </div>
                        </div>
                    </div>
                    <div :class="buttonsContainerClass">
                        <button 
                            v-if="!certificate.editing" 
                            :class="editButtonClass" 
                            @click="startEditing(certificate)"
                        >
                            Editar
                        </button>
                        <div :class="containerEditingClass" v-else>
                            <button 
                                :class="cancelButtonClass" 
                                @click="cancelEditing(certificate)"
                            >
                                Cancelar
                            </button>
                            <button 
                                :class="acceptButtonClass" 
                                @click="acceptChanges(certificate)"
                            >
                                Aceitar
                            </button>
                        </div>
                    </div>
                </div>
            </CardComponent>
        </div>
    </div>
</template>

<script>
import styles from './CertificateManager.module.scss';
import CardComponent from '@/components/Card/Card.vue';
import { db } from '../../firebaseDb';
import { ref, get, update, remove, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'CertificateManager',
    components: {
        CardComponent
    },
    data() {
        return {
            certificates: [],
        };
    },
    created() {
        this.fetchCertificates();
    },
    computed: {
        buttonsContainerClass() {
            return styles.buttons__container;
        },
        acceptButtonClass() {
            return `${styles.button} ${styles['button--accept']}`;
        },
        editButtonClass() {
            return `${styles.button} ${styles['button--edit']}`;
        },
        cancelButtonClass() {
            return `${styles.button} ${styles['button--cancel']}`;
        },
        containerEditingClass() {
            return `${styles.buttons__container} ${styles['buttons__container--editing']}`;
        },
        headerContainerClass() {
            return styles.header__container;
        },
        addButtonClass() {
            return `${styles.button} ${styles['button--add']}`;
        },
        cardContainerClass() {
            return styles.card__container;
        },
        trashIconClass() {
            return styles.trash__icon;
        },
        returnClass() {
            return styles.return;
        },
    },
    methods: {
        async fetchCertificates() {
            try {
                const certificatesRef = ref(db, 'certificates');
                const snapshot = await get(certificatesRef);
                const certificatesData = snapshot.val();
                this.certificates = Object.keys(certificatesData || {}).map(id => ({
                    id,
                    type: certificatesData[id].type,
                    validity: certificatesData[id].validity,
                    editing: false,
                }));
            } catch (error) {
                console.error('Erro ao buscar certificados:', error);
            }
        },
        addCertificateCard() {
            this.certificates.push({
                id: null,
                type: '',
                validity: '',
                editing: true,
            });
        },
        startEditing(certificate) {
            certificate.originalType = certificate.type;
            certificate.originalValidity = certificate.validity;
            certificate.editing = true;
        },
        cancelEditing(certificate) {
            if (certificate.originalType) {
                certificate.type = certificate.originalType;
                certificate.validity = certificate.originalValidity;
            } else {
                this.certificates = this.certificates.filter(c => c !== certificate);
            }
            certificate.editing = false;
        },
        async acceptChanges(certificate) {
            if (!certificate.type || !certificate.validity) {
                alert("Por favor, selecione o tipo de certificado e o prazo de validade.");
                return;
            }
            
            certificate.editing = false;
            
            try {
                if (certificate.id) {
                    const certificateRef = ref(db, `certificates/${certificate.id}`);
                    await update(certificateRef, {
                        type: certificate.type,
                        validity: certificate.validity,
                    });
                } else {
                    const customId = uuidv4();
                    const newCertificateRef = ref(db, `certificates/${customId}`);
                    await set(newCertificateRef, {
                        type: certificate.type,
                        validity: certificate.validity,
                    });
                    certificate.id = customId;
                }
            } catch (error) {
                console.error('Erro ao salvar certificado:', error);
            }
        },
        async removeCertificate(certificateId, index) {
            try {
                if (certificateId) {
                    const certificateRef = ref(db, `certificates/${certificateId}`);
                    await remove(certificateRef);
                }
                this.certificates.splice(index, 1);
            } catch (error) {
                console.error('Erro ao remover certificado:', error);
            }
        }
    }
};
</script>
