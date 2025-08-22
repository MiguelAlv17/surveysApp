<script setup> 
    const {texto,icon,custom_color} = defineProps({
        texto: {
        type: String,
        Default: "Button",
        },
        icon : {
            type : String,
            Default: 'error'
        },
        custom_color:{
            type: String,
            Default: 'green'
        }
    }, ['funcion'])
</script>
<template>
    <button @click="$emit('funcion')" class="btn-custom" style="    border: 0px; background-color: #80808000;">
        <div class="custom_card" style="width: 11rem;" :class="custom_color">
            <div class="card-body d-flex  " style="flex-direction: column; justify-content: center;">
                <span class="material-icons" style="font-size:50px; text-align:center;">
                    {{icon}}
                </span>
                <h5 class="card-title">{{ texto }}</h5>
            </div>
        </div>
    </button>
    
</template>
<style scoped>
.custom_card{
    padding: .5rem;
    border:2px;
    border-style: solid;
    border-radius: 5px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
}
.green{
    background-color: rgb(1, 163, 1);
    color: white;
}
.orange{
    background-color: rgb(177, 114, 19);
    color: white;
}
.purple{
    background-color: rgb(163, 1, 163);
    color: white;
}
.blue{
    background-color: rgb(1, 77, 163);
    color: white;
}
.pink{
    background-color: rgb(163, 1, 114);
    color: white;
}
.red{
    background-color: rgb(187, 16, 10);
    color: white;
}
.btn-custom{
    cursor: pointer;
}
</style>