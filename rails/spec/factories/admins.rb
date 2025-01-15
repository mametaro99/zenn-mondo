FactoryBot.define do
  factory :admin do
    name { "田中太郎" }
    sequence(:email) {|n| "#{n}_" + "test@example.com" }
    password { "password" }
  end
end
