<template>
    <div>
        <div :class="headerContainerClass">
            <router-link :class="returnClass" style="height: fit-content;" to="/">
                <img src="@/assets/arrow-right.svg" alt="Logo" />
            </router-link>
            <h1>Gerenciar clientes</h1>
            <button :class="addButtonClass" @click="addClientCard">Adicionar</button>
        </div>
        <div :class="cardContainerClass">
            <CardComponent v-for="(client, index) in clients" :key="client.id || index">
                <img v-if="!client.editing" :class="trashIconClass" src="../../assets/trash.png" alt="Remover cliente" @click="removeClient(client.id, index)">
                <div :class="mainContainerClass">
                    <div>
                        <div>
                            <input
                                type="text" 
                                v-model="client.name" 
                                placeholder="Nome do cliente" 
                                :disabled="!client.editing"
                            />
                        </div>
                        <p v-if="!client.editing">Registro: {{ formatDate(client.date) }}</p>
                        <input
                            v-else
                            type="date" 
                            v-model="client.date"
                            :disabled="true"
                        />
                    </div>
                    <div :class="buttonsContainerClass">
                        <button 
                            v-if="!client.editing" 
                            :class="editButtonClass" 
                            @click="startEditing(client)"
                        >
                            Editar
                        </button>
                        <div :class="containerEditingClass" v-else>
                            <button 
                                :class="cancelButtonClass" 
                                @click="cancelEditing(client)"
                            >
                                Cancelar
                            </button>
                            <button 
                                :class="acceptButtonClass" 
                                @click="acceptChanges(client)"
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
import styles from './ClientManager.module.scss';
import CardComponent from '@/components/Card/Card.vue';
import { db } from '../../firebaseDb';
import { ref, get, update, remove, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'ClientsPage',
    components: {
        CardComponent
    },
    data() {
        return {
            clients: [],
        };
    },
    created() {
        this.fetchClients();
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
        mainContainerClass() {
            return styles.main__container;
        },
    },
    methods: {
        async fetchClients() {
            try {
                const clientsRef = ref(db, 'clients');
                const snapshot = await get(clientsRef);
                const clientsData = snapshot.val();
                this.clients = Object.keys(clientsData || {}).map(id => ({
                    id,
                    name: clientsData[id].name,
                    date: clientsData[id].date,
                    editing: false,
                }));
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            }
        },
        addClientCard() {
            this.clients.push({
                id: null,
                name: '',
                date: '',
                editing: true,
            });
        },
        startEditing(client) {
            client.originalName = client.name;
            client.originalDate = client.date;
            client.editing = true;
        },
        cancelEditing(client) {
            if (client.originalName) {
                client.name = client.originalName;
                client.date = client.originalDate;
            } else {
                this.clients = this.clients.filter(c => c !== client);
            }
            client.editing = false;
        },
        async acceptChanges(client) {
            if (!client.date) {
                const now = new Date();
                client.date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
            }
            client.editing = false;
            try {
                if (client.id) {
                    const clientRef = ref(db, `clients/${client.id}`);
                    await update(clientRef, {
                        name: client.name,
                        date: client.date,
                    });
                } else {
                    const customId = uuidv4();
                    const newClientRef = ref(db, `clients/${customId}`);
                    await set(newClientRef, {
                        name: client.name,
                        date: client.date,
                    });
                    client.id = customId;
                }
            } catch (error) {
                console.error('Erro ao salvar cliente:', error);
            }
        },
        async removeClient(clientId, index) {
            try {
                if (clientId) {
                    const clientRef = ref(db, `clients/${clientId}`);
                    await remove(clientRef);
                }
                this.clients.splice(index, 1);
            } catch (error) {
                console.error('Erro ao remover cliente:', error);
            }
        },
        formatDate(dateString) {
            return dateString ? dateString : '';
        }
    }
};
</script>
