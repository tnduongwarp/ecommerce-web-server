# english-web-server
pull code về => npm install => thêm thư mục .env chứa nội dung sau:
PORT = 3000
NODE_ENV = 'development'
TOKEN_KEY = '$2a$10$N.1fhxAvV3cEMYXqMIKmOeYzgzNavEYBUMLJmrQYmDfZdBuuj3K.y'
sau đó npm start để chạy

# chạy code
commit trước tôi có đặt tên bảng hơi sai nên lần này đã sửa lại, để chạy thì các ông xóa tất cả các bảng của database cnweb, sau đó chạy lệnh : npx sequelize-cli db:migrate.

# auth api:
- POST  localhost:3000/auth/login
body: {
    "username": "tnduong",
    "password": "123456789"
}

- POST localhost:3000/auth/signUp
body: {
    "username": "tnduong",
    "password": "123456789",
    "email": "duong@gmail.com",
    "role" : "user",
    "profile_picture":"url_to_picture" --cái này là option, ko có cũng dc
}

 # khi logout cần truyền refreshToken để server vô hiệu hóa refeshToken đó
- DELETE localhost:3000/auth/logout
body: {
    "refreshToken":"eyjdhfjdfh..."
}

# truyền refreshToken để lấy accessToken mới
- POST localhost:3000/refresh-token
body: {
    "refreshToken":"eyjdhfjdfh..."
}

# lấy các lesson trong 1 course ( course là các mục trên thanh sidebar)
- POST localhost:3000/lesson/get-all-lesson
body:{
    courseId: 1,
    userId: 1,
    categoryId: 1
}

# lấy quiz của lesson bằng lesson id
- GET localhost:3000/lesson/get-quiz/:id
# update status của lesson khi học xong hoặc đang học dở:
- POST localhost:3000/lesson/update-status
body:{
    status: 'Inprogress' (status là 1 trong 3 loại đã định nghĩa trong app constant),
    updateAt: new Date(),
    lessonId: 1,
    userId: 1
}