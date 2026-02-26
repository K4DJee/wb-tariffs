# Тестовое задание

## Описание
Сервис для регулярного сбора тарифов Wildberries и сихронизация с Google Sheets.

**Функционал сервиса**
- Получение данных с API Wildberries: `https://common-api.wildberries.ru/api/v1/tariffs/box`.
- Сохранение данных в СУБД PostgreSQL.
- Выгрузка отсортированных данных в Google Sheets, в произвольное количество таблиц.

## Перед запуском
Убедитесь, что у вас есть .env со всеми необходимыми данными. В этом репозитории есть файл `example.env` с примерными данными.

## Запуск приложения
1. Клонируйте репозиторий: `git clone https://github.com/K4DJee/wb-tariffs.git`.
2. Установите все зависимости: `npm install`.
3. Запустите docker container с СУБД PostgreSQL: `docker run --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wb_tariffs_postgres -p 5432:5432 -d postgres`.
4. Запустите приложение командой: `npm run dev` или же `npm run build` и `npm run start`.

## Запуск приложения через Docker Compose
Такой запуск ожидается для финальной проверки
1. Запустите команду: `docker compose up`.