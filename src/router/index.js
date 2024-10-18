import Vue from 'vue';
import Router from 'vue-router';
import ContainerLayout from '../layouts/Layout.vue';
import HomePage from '../pages/Home/Home.vue';
import ClientsPage from '../pages/ClientManager/ClientManager.vue';
import CertificatesPage from '../pages/CertificateManager/CertificateManager.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    { 
      path: '/', 
      component: ContainerLayout, 
      children: [
        { path: '', component: HomePage },
        { path: 'client-manager', component: ClientsPage },
        { path: 'certificate-manager', component: CertificatesPage }
      ]
    }
  ]
});
