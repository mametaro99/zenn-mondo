# spec/models/test_spec.rb

require 'rails_helper'

RSpec.describe Test, type: :model do
  # バリデーションのテスト
  describe 'validations' do
    it 'is valid with valid attributes' do
      test = Test.new(title: 'Test Title', description: 'Test Description')
      expect(test).to be_valid
    end

    it 'is invalid without a title' do
      test = Test.new(title: nil, description: 'Test Description')
      expect(test).to_not be_valid
      expect(test.errors.full_messages).to eq ["タイトル を入力してください"]
    end

    it 'is invalid without a description' do
      test = Test.new(title: 'Test Title', description: nil)
      expect(test).to_not be_valid
      expect(test.errors.full_messages).to eq ["説明 を入力してください"]
    end
  end
end
