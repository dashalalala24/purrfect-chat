# Purrfect Chat

Учебный SPA-мессенджер на TypeScript с кастомной компонентной системой (`Block`), роутером, HTTP-транспортом и страницами авторизации, профиля, чатов, 404 и 5xx.

## Функциональность

- Авторизация и регистрация.
- Просмотр списка чатов и отправка сообщений.
- Работа с профилем пользователя (включая аватар и редактирование данных).
- Клиентский роутинг.
- Обработка ошибок (страницы 404 и 500).
- Unit-тесты для ключевых модулей: `Router`, `Block`, `HTTPTransport`.

## Технологии

- TypeScript
- Handlebars
- Vite
- PostCSS
- Express
- Mocha + Chai + Sinon + JSDOM
- ESLint + Stylelint
- Husky

## Ссылки

- Netlify: `purrfect-chat.netlify.app`
- Прототипы: `https://www.figma.com/design/DODcit19umTYc0WJdGHJ1w/Untitled?node-id=0-1&p=f&t=2fyJf9Iomdr3u6C4-0`

## Установка

```bash
npm install
```

## Запуск проекта

```bash
npm run dev
```

Приложение поднимется в dev-режиме через Vite.

## Сборка и запуск production-версии

```bash
npm run build
```

```bash
npm start
```

`npm start` выполняет сборку и запускает Node-сервер.

## Тесты

Запуск всех unit-тестов:

```bash
npm test
```

Тесты лежат рядом с тестируемыми модулями:

- `src/services/Router.test.ts`
- `src/services/Block.test.ts`
- `src/httpTransport/httpTransport.test.ts`
