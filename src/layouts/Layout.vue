<template>
    <div :class="layoutClass">
        <router-view></router-view>
    </div>
</template>

<script>
    import styles from './Layout.module.scss';
    
    export default {
        name: 'ContainerLayout',
        computed: {
            layoutClass() {
                return styles.layout;
            }
        }
    };
</script>