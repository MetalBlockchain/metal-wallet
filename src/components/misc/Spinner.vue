<template>
    <div class="spinner">
        <p class="spinner">
            <fa icon="spinner"></fa>
        </p>
    </div>
</template>
<script>
export default {}
</script>
<style scoped lang="scss">
.spinner {
    width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    animation-name: spin;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    transform-origin: center;
    display: flex;
    justify-content: center;
    color: var(--primary-color);
    align-items: center;
}
@keyframes spin {
    from {
        transform: rotateZ(0deg);
    }
    to {
        transform: rotateZ(360deg);
    }
}
</style>
