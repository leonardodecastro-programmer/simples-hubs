<template>
    <div
        @click="handleClick"
        :class="cardClass"
        :style="{ 
            backgroundColor: isRedirectValid ? '#E2E8F0' : '#F8FAFC',
            border: !isRedirectValid && '1px solid #E2E8F0',
            cursor: isRedirectValid ? 'pointer' : 'default',
            width: isRedirectValid ? '269px' : '240px',
        }"
    >
        <template v-if="isRedirectValid">
            <img 
                :src="redirect.image" 
                :class="logoClass"  
                alt="Descrição da imagem" 
            />
            <div :class="redirectClass">
                <p>{{ redirect.text }}</p>
                <img src="../../assets/arrow-right.svg" alt="Outra imagem" />
            </div>
        </template>
        <template v-else>
            <slot></slot>
        </template>
    </div>
</template>

<script>
    import styles from './Card.module.scss';

    export default {
        name: 'CardComponent',
        props: {
            click: {
                type: Function,
                default: null,
            },
            redirect: {
                type: Object,
                default: () => ({
                    image: null,
                    text: null,
                }),
            },
        },
        computed: {
            cardClass() {
                return styles.card;
            },
            logoClass() {
                return styles.logo;
            },
            redirectClass() {
                return styles.redirect;
            },
            isRedirectValid() {
            return this.redirect.image && this.redirect.text;
            }
        },
        methods: {
        handleClick() {
            if (this.click) {
                this.click();
            }
        }
    }
    };
</script>