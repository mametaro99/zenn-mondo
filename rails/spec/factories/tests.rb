FactoryBot.define do
  factory :test do
    title { Faker::Lorem.sentence }
    description { Faker::Lorem.sentence }
  end
end
