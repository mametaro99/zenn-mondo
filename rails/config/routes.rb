Rails.application.routes.draw do
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?
  namespace :api do
    namespace :v1 do
      get "health_check", to: "health_check#index"
      mount_devise_token_auth_for "User", at: "auth"

      mount_devise_token_auth_for 'Admin', at: 'auth'

      namespace :current do
        resource :admin, only: [:show]
      end

      namespace :user do
        resource :confirmations, only: [:update]
      end

      namespace :current do
        resources :tests, only: [:index, :create, :update, :destroy] do
          resources :test_answers, only: [:index, :create], module: :tests
          resources :questions, only: [:create, :update, :destroy], module: :tests
        end
        resource :user, only: [:show]
      end
      resources :tests, only: [:index, :show] do
        resources :questions, only: [:index], module: :tests
      end
    end
  end
end
