import swal from 'sweetalert2'
const alert_success = (titleText = "", subt = "", segs = 1.5) => {
    const time_mils = segs * 1000;
    const subtitle = `<h5>${subt}</h5>`
    return new Promise((resolve) => {
        swal.fire({
            position: "center",
            icon: "success",
            html: subtitle,
            title: titleText,
            showConfirmButton: false,
            timer: time_mils,
            timerProgressBar: true,
            allowOutsideClick: false
        }).then(() => {
            resolve(); // Resuelve la promesa cuando termina
        });
    });

}
const alert_error = (titleText = "Ooops!", subt = "", segs = 1.5) => {
    const time_mils = segs * 1000;
    const subtitle = `<h5>${subt}</h5>`
    swal.fire({
        position: "center",
        icon: "error",
        html: subtitle,
        title: titleText,
        showConfirmButton: true,
        timer: time_mils,
        timerProgressBar: true,
        allowOutsideClick: false
    })
}
const loaderSweet = () => {
    Swal.fire({
        title: 'Esta seguro de guardar el registro',
        showCancelButton: true,
        confirmButtonText: 'Look up',
        showLoaderOnConfirm: true,
        preConfirm: (login) => {
            return fetch(`//api.github.com/users/${login}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText)
                    }
                    return response.json()
                })
                .catch(error => {
                    Swal.showValidationMessage(
                        `Request failed: ${error}`
                    )
                })
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: `${result.value.login}'s avatar`,
                imageUrl: result.value.avatar_url
            })
        }
    })
}

const alert_warning = (titleText = "Aviso!", subt = "", segs = 1.5) => {
    const time_mils = segs * 1000;
    const subtitle = `<h5>${subt}</h5>`
    swal.fire({
        position: "center",
        icon: "warning",
        html: subtitle,
        title: titleText,
        showConfirmButton: true,
        timer: time_mils,
        timerProgressBar: true,
        allowOutsideClick: false
    })
}
export { alert_success, alert_error, loaderSweet, alert_warning }
